import { Extension } from '@tiptap/core'
import type { Node as PMNode } from '@tiptap/pm/model'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import { relativePositionToAbsolutePosition, ySyncPluginKey } from '@tiptap/y-tiptap'
import * as Y from 'yjs'

/**
 * Configuration for {@link AiInsertReveal}.
 */
export type AiInsertRevealOptions = {
  /**
   * CSS class applied to each freshly-inserted run. Style this class in your app
   * to define the fade (see the package docs for a default).
   */
  className: string
  /**
   * How long (ms) each run keeps its reveal decoration before it is dropped.
   * Keep it at or above your CSS animation duration so the fade can finish.
   */
  durationMs: number
}

/**
 * Upper bound (chars) on one revealed run: the text from a single streamed
 * insert, usually a token of a few chars. This only guards against a
 * mis-resolved relative position yielding an absurd range (e.g. spanning the
 * whole document).
 */
const MAX_REVEAL_RANGE = 400

/**
 * One freshly-inserted text run, anchored by Yjs relative positions so it stays
 * valid across the whole-document rebuild that y-tiptap applies on every remote
 * sync (a plain ProseMirror position would be collapsed by that rebuild).
 */
type RevealEntry = {
  start: Y.RelativePosition
  end: Y.RelativePosition
  at: number
}

/** Minimal shape of the y-sync plugin state we read. */
type YSyncState = {
  doc: Y.Doc
  type: Y.XmlFragment
  binding: { mapping: Map<Y.AbstractType<unknown>, PMNode | PMNode[]> } | null
}

const aiInsertRevealKey = new PluginKey('aiInsertReveal')

function resolveRevealRange(
  ystate: YSyncState,
  entry: RevealEntry,
  now: number,
  durationMs: number,
): { from: number; to: number; age: number } | null {
  const age = now - entry.at
  if (age >= durationMs) return null

  const span = resolveSpan(ystate, entry)
  return span === null ? null : { ...span, age }
}

function resolveSpan(ystate: YSyncState, entry: RevealEntry): { from: number; to: number } | null {
  if (!ystate.binding) return null

  const from = relativePositionToAbsolutePosition(
    ystate.doc,
    ystate.type,
    entry.start,
    ystate.binding.mapping,
  )
  const to = relativePositionToAbsolutePosition(
    ystate.doc,
    ystate.type,
    entry.end,
    ystate.binding.mapping,
  )
  return from === null || to === null ? null : orderedSpan(from, to)
}

function orderedSpan(from: number, to: number): { from: number; to: number } | null {
  const a = Math.min(from, to)
  const b = Math.max(from, to)
  return a >= b || b - a > MAX_REVEAL_RANGE ? null : { from: a, to: b }
}

function collectInsertedRuns(event: Y.YEvent<Y.AbstractType<unknown>>, now: number): RevealEntry[] {
  const target = event.target
  if (!(target instanceof Y.XmlText)) return []

  const runs: RevealEntry[] = []
  let index = 0
  for (const op of event.delta) {
    const { advance, inserted } = scanDeltaOp(op)
    if (inserted > 0) runs.push(makeRun(target, index, inserted, now))
    index += advance
  }
  return runs
}

function scanDeltaOp(op: { retain?: number; insert?: unknown }): {
  advance: number
  inserted: number
} {
  if (typeof op.retain === 'number') return { advance: op.retain, inserted: 0 }
  if (typeof op.insert === 'string')
    return { advance: op.insert.length, inserted: op.insert.length }
  // A non-string insert (embed) advances one position but is not a revealed run.
  return op.insert === undefined ? { advance: 0, inserted: 0 } : { advance: 1, inserted: 0 }
}

/**
 * The end anchor binds to the run's last char (assoc < 0) so a token appended
 * here starts its own run instead of extending this one.
 */
function makeRun(target: Y.XmlText, index: number, length: number, now: number): RevealEntry {
  return {
    start: Y.createRelativePositionFromTypeIndex(target, index),
    end: Y.createRelativePositionFromTypeIndex(target, index + length, -1),
    at: now,
  }
}

/**
 * Fades in text inserted by remote Yjs transactions using view-only inline
 * decorations anchored by relative positions. It never mutates the document,
 * so it stays inert to accept/reject and to persistence, and local edits are
 * ignored so a user's own typing does not fade. Requires the Collaboration
 * extension and CSS on the configured `className` (default `ai-insert-reveal`).
 */
export const AiInsertReveal = Extension.create<AiInsertRevealOptions>({
  name: 'aiInsertReveal',

  addOptions() {
    return {
      className: 'ai-insert-reveal',
      durationMs: 550,
    }
  },

  addProseMirrorPlugins() {
    const { className, durationMs } = this.options

    // Runs in insertion (time) order, so expired entries are always a prefix.
    const entries: RevealEntry[] = []

    const dropExpired = (now: number) => {
      let firstActive = 0
      while (firstActive < entries.length && now - entries[firstActive].at >= durationMs) {
        firstActive += 1
      }
      if (firstActive > 0) entries.splice(0, firstActive)
    }

    return [
      new Plugin({
        key: aiInsertRevealKey,

        props: {
          decorations: state => {
            const ystate = ySyncPluginKey.getState(state) as YSyncState | undefined
            if (entries.length === 0 || !ystate?.binding) return null

            const now = Date.now()
            const decorations = entries
              .map(entry => resolveRevealRange(ystate, entry, now, durationMs))
              .filter((range): range is NonNullable<typeof range> => range !== null)
              // y-tiptap rebuilds the whole doc per token, restarting the CSS
              // animation; offset by the run's age to resume the fade instead.
              .map(range =>
                Decoration.inline(range.from, range.to, {
                  class: className,
                  style: `animation-delay: -${Math.round(range.age)}ms`,
                }),
              )

            return DecorationSet.create(state.doc, decorations)
          },
        },

        view: view => {
          const initialState = ySyncPluginKey.getState(view.state) as YSyncState | undefined
          const fragment = initialState?.type ?? null

          let raf: number | null = null
          let pruneTimer: ReturnType<typeof setTimeout> | null = null

          const rerender = () => {
            if (view.isDestroyed) return
            // Empty transaction: re-runs `decorations` so new entries paint (and
            // expired ones are dropped). Kept out of the undo history.
            view.dispatch(view.state.tr.setMeta('addToHistory', false))
          }

          // Coalesce bursts of tokens landing in the same frame into one render.
          const scheduleRerender = () => {
            if (raf !== null) return
            raf = requestAnimationFrame(() => {
              raf = null
              rerender()
            })
          }

          // After the stream pauses, one delayed render removes the last runs'
          // decorations once their fades have completed.
          const schedulePrune = () => {
            if (pruneTimer !== null) clearTimeout(pruneTimer)
            pruneTimer = setTimeout(() => {
              pruneTimer = null
              dropExpired(Date.now())
              rerender()
            }, durationMs + 80)
          }

          const onChange = (
            events: Array<Y.YEvent<Y.AbstractType<unknown>>>,
            transaction: Y.Transaction,
          ) => {
            // Only remote edits, i.e. the AI. The local user's own typing is a
            // local transaction and must not fade.
            if (transaction.local) return

            const now = Date.now()
            dropExpired(now)

            const runs = events.flatMap(event => collectInsertedRuns(event, now))
            if (runs.length === 0) return

            entries.push(...runs)
            scheduleRerender()
            schedulePrune()
          }

          fragment?.observeDeep(onChange)

          return {
            destroy: () => {
              fragment?.unobserveDeep(onChange)
              if (raf !== null) cancelAnimationFrame(raf)
              if (pruneTimer !== null) clearTimeout(pruneTimer)
              entries.length = 0
            },
          }
        },
      }),
    ]
  },
})
