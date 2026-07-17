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
   * to define the fade (see the package docs for a default). Change it to run
   * more than one reveal effect, or to avoid a class-name collision.
   */
  className: string
  /**
   * How long (ms) each run keeps its reveal decoration before it is dropped.
   * Keep it at or above your CSS animation duration so the fade can finish.
   */
  durationMs: number
}

/**
 * Upper bound (chars) on a single revealed run. A normal streamed token is a
 * few chars; this only guards against a mis-resolved relative position yielding
 * an absurd range (e.g. spanning the whole document).
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

/**
 * Resolves one reveal entry to an absolute range, or null if it has expired, its
 * anchors no longer resolve (the run's text was deleted by a concurrent edit), or
 * the span is empty or implausibly large. Returns the run's `age` so the caller
 * can seed the fade from it.
 */
function resolveRevealRange(
  ystate: YSyncState,
  entry: RevealEntry,
  now: number,
  durationMs: number,
): { from: number; to: number; age: number } | null {
  if (!ystate.binding) return null

  const age = now - entry.at
  if (age >= durationMs) return null

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
  if (from === null || to === null) return null

  const a = Math.min(from, to)
  const b = Math.max(from, to)
  if (a >= b || b - a > MAX_REVEAL_RANGE) return null

  return { from: a, to: b, age }
}

/**
 * Extracts the freshly-inserted text runs carried by one remote Yjs event,
 * anchored by relative positions. Returns an empty array when the event's target
 * is not a text node or carries no string inserts.
 */
function collectInsertedRuns(event: Y.YEvent<Y.AbstractType<unknown>>, now: number): RevealEntry[] {
  const target = event.target
  if (!(target instanceof Y.XmlText)) return []

  const runs: RevealEntry[] = []
  let index = 0
  for (const op of event.delta) {
    if (typeof op.retain === 'number') {
      index += op.retain
    } else if (typeof op.insert === 'string') {
      const length = op.insert.length
      if (length > 0) {
        runs.push({
          start: Y.createRelativePositionFromTypeIndex(target, index),
          // Anchor the end to the run's last char (assoc < 0) so the next token
          // appended here starts its own run instead of extending this one.
          end: Y.createRelativePositionFromTypeIndex(target, index + length, -1),
          at: now,
        })
      }
      index += length
    } else if (op.insert !== undefined) {
      index += 1
    }
  }
  return runs
}

/**
 * Fades in text that arrives from a remote peer (the Server AI Toolkit streaming
 * into the shared Y.Doc), one run per token, without mutating the document.
 *
 * It reads the authored signal directly: each remote Yjs transaction carries a
 * delta describing exactly what was inserted and where. Those ranges are stored
 * as relative positions and re-resolved to absolute positions on every render to
 * drive view-only inline decorations. It does no document diffing and adds no
 * marks, so it is inert to accept/reject and to persistence. Local edits are
 * ignored via `transaction.local`, so a user typing sees no fade.
 *
 * Requires the Collaboration extension (its y-sync plugin) to be present. The
 * actual fade is defined in CSS on the configured `className` (default
 * `ai-insert-reveal`); without that stylesheet the decorations are added but
 * invisible.
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
            if (entries.length === 0) return null
            const ystate = ySyncPluginKey.getState(state) as YSyncState | undefined
            if (!ystate?.binding) return null

            const now = Date.now()
            const decorations: Decoration[] = []
            for (const entry of entries) {
              const range = resolveRevealRange(ystate, entry, now, durationMs)
              if (range === null) continue

              // Seed the CSS animation from the run's real age so a re-render
              // (y-tiptap rebuilds the doc on every token) resumes the fade at
              // the correct point instead of restarting it.
              decorations.push(
                Decoration.inline(range.from, range.to, {
                  class: className,
                  style: `animation-delay: -${Math.round(range.age)}ms`,
                }),
              )
            }

            return decorations.length ? DecorationSet.create(state.doc, decorations) : null
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

            let captured = false
            for (const event of events) {
              const runs = collectInsertedRuns(event, now)
              if (runs.length > 0) {
                entries.push(...runs)
                captured = true
              }
            }

            if (captured) {
              scheduleRerender()
              schedulePrune()
            }
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
