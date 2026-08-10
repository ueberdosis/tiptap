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
  /** CSS class on each revealed run; style it in your app to define the fade. */
  className: string
  /**
   * How long (ms) each run keeps its reveal decoration before it is dropped.
   * Keep it at or above your CSS animation duration so the fade can finish.
   */
  durationMs: number
  /**
   * The collaboration provider, e.g. `HocuspocusProvider` or `TiptapCloudProvider`.
   * Its awareness is what identifies the AI, so nothing is revealed without it.
   */
  provider: RevealProvider | null
}

/** The awareness surface this extension reads from the provider. */
export type RevealProvider = {
  awareness?: {
    getStates: () => Map<number, Record<string, any> | undefined>
    on: (event: 'change', listener: () => void) => void
    off: (event: 'change', listener: () => void) => void
  }
}

/** Caps the fade to a run's first N chars; the rest reveals instantly. */
const MAX_REVEAL_RANGE = 400

/** ProseMirror compares decoration attrs by value, so an unrounded offset rebuilds the DOM. */
const REVEAL_AGE_STEP = 100

/** Above this, an update is a document sync, such as joining a room, not live streaming. */
const MAX_BLOCKS_PER_UPDATE = 2

/** Yjs relative positions so each run survives y-tiptap doc rebuilds. */
type RevealEntry = {
  start: Y.RelativePosition
  end: Y.RelativePosition
  at: number
  /** Inserted char count; a resolved span that drifts from it is stale. */
  length: number
  /** Author, resolved against awareness at render time rather than on arrival. */
  client: number
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
  docSize: number,
): { from: number; to: number; age: number } | null {
  const age = now - entry.at
  if (age >= durationMs) return null

  const span = resolveSpan(ystate, entry, docSize)
  return span === null ? null : { ...span, age }
}

function resolveSpan(
  ystate: YSyncState,
  entry: RevealEntry,
  docSize: number,
): { from: number; to: number } | null {
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
  return from === null || to === null ? null : clampSpan(from, to, entry.length, docSize)
}

/** Drops a span whose width drifted from the insert, so stale mappings never paint. */
function clampSpan(
  from: number,
  to: number,
  length: number,
  docSize: number,
): { from: number; to: number } | null {
  const lo = Math.min(from, to)
  const hi = Math.max(from, to)
  if (hi - lo !== length) return null

  const start = Math.max(0, lo)
  const end = Math.min(docSize, hi, start + MAX_REVEAL_RANGE)
  return start >= end ? null : { from: start, to: end }
}

/** Merges touching runs with the same offset, so a stream paints a few spans, not one per token. */
function mergeRuns(
  ranges: Array<{ from: number; to: number; age: number }>,
): Array<{ from: number; to: number; delay: number }> {
  const merged: Array<{ from: number; to: number; delay: number }> = []

  for (const range of ranges) {
    const delay = Math.round(range.age / REVEAL_AGE_STEP) * REVEAL_AGE_STEP
    const last = merged[merged.length - 1]

    if (last !== undefined && last.delay === delay && last.to === range.from) {
      last.to = range.to
    } else {
      merged.push({ from: range.from, to: range.to, delay })
    }
  }

  return merged
}

/** The Tiptap AI server tags the identity it publishes with an instance id. */
function isAiUser(user: Record<string, any> | undefined): boolean {
  return Boolean(user?.aiInstanceId)
}

/** Clients whose clock advanced in this transaction, i.e. who authored it. */
function transactionAuthors(transaction: Y.Transaction): number[] {
  const authors: number[] = []
  transaction.afterState.forEach((clock, client) => {
    if ((transaction.beforeState.get(client) ?? 0) < clock) authors.push(client)
  })
  return authors
}

function collectInsertedRuns(
  event: Y.YEvent<Y.AbstractType<unknown>>,
  now: number,
  client: number,
): RevealEntry[] {
  const target = event.target
  const runs: RevealEntry[] = []

  if (target instanceof Y.XmlText) {
    let index = 0
    for (const op of event.delta) {
      const { advance, inserted } = scanDeltaOp(op)
      if (inserted > 0) runs.push(makeRun(target, index, inserted, now, client))
      index += advance
    }
    return runs
  }

  // Whole nodes arrive when the AI writes a heading or a fresh block, so their
  // text never shows up as an insert into existing content.
  for (const op of event.delta) {
    if (!Array.isArray(op.insert)) continue
    if (op.insert.length > MAX_BLOCKS_PER_UPDATE) continue
    for (const node of op.insert) collectNodeText(node, now, client, runs)
  }
  return runs
}

function collectNodeText(node: unknown, now: number, client: number, runs: RevealEntry[]): void {
  if (node instanceof Y.XmlText) {
    if (node.length > 0) runs.push(makeRun(node, 0, node.length, now, client))
    return
  }
  if (node instanceof Y.XmlElement) {
    for (const child of node.toArray()) collectNodeText(child, now, client, runs)
  }
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
 * End anchor assoc < 0 so an appended token starts a new run, not extends it.
 * At index 0 the start needs the same assoc, or it resolves to nothing.
 */
function makeRun(
  target: Y.XmlText,
  index: number,
  length: number,
  now: number,
  client: number,
): RevealEntry {
  return {
    start: Y.createRelativePositionFromTypeIndex(target, index, index === 0 ? -1 : 0),
    end: Y.createRelativePositionFromTypeIndex(target, index + length, -1),
    at: now,
    length,
    client,
  }
}

/**
 * Fades in text the AI streams into the document, using view-only decorations.
 * It never mutates the document, so it is inert to accept/reject and persistence.
 * Requires Collaboration, a provider, and CSS for `className` (default `ai-insert-reveal`).
 */
export const AiInsertReveal = Extension.create<AiInsertRevealOptions>({
  name: 'aiInsertReveal',

  addOptions() {
    return {
      className: 'ai-insert-reveal',
      durationMs: 550,
      provider: null,
    }
  },

  onCreate() {
    const { provider, durationMs } = this.options

    if (!provider) {
      console.warn(
        '[tiptap warn]: The "provider" option is required for "AiInsertReveal" to tell the AI apart from other collaborators. Nothing is revealed without it.',
      )
    } else if (!provider.awareness) {
      console.warn(
        '[tiptap warn]: The provider passed to "AiInsertReveal" has no awareness, so the AI cannot be identified. Nothing is revealed.',
      )
    }

    if (durationMs <= 0) {
      console.warn(
        `[tiptap warn]: "AiInsertReveal" needs a positive "durationMs" to hold a reveal, got ${durationMs}. Nothing is revealed.`,
      )
    }
  },

  addProseMirrorPlugins() {
    const { className, durationMs, provider } = this.options

    // Runs in insertion (time) order, so expired entries are always a prefix.
    const entries: RevealEntry[] = []

    // Never pruned: the AI clears its awareness entry when it stops, and its first
    // tokens can arrive before that entry lands.
    const aiClients = new Set<number>()

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
            const ranges = entries
              .filter(entry => aiClients.has(entry.client))
              .map(entry =>
                resolveRevealRange(ystate, entry, now, durationMs, state.doc.content.size),
              )
              .filter((range): range is NonNullable<typeof range> => range !== null)

            // y-tiptap rebuilds the whole doc per token, restarting the CSS
            // animation; offset by the run's age to resume the fade instead.
            const decorations = mergeRuns(ranges).map(range =>
              Decoration.inline(range.from, range.to, {
                class: className,
                style: `animation-delay: -${range.delay}ms`,
              }),
            )

            return DecorationSet.create(state.doc, decorations)
          },
        },

        view: view => {
          const initialState = ySyncPluginKey.getState(view.state) as YSyncState | undefined
          const fragment = initialState?.type ?? null
          const awareness = provider?.awareness ?? null

          if (fragment === null) {
            console.warn(
              '[tiptap warn]: "AiInsertReveal" needs the Collaboration extension to see incoming text. Nothing is revealed.',
            )
          }

          const trackAiClients = () => {
            const known = aiClients.size
            awareness
              ?.getStates()
              .forEach((state: Record<string, any> | undefined, clientId: number) => {
                if (isAiUser(state?.user)) aiClients.add(clientId)
              })
            // Runs that arrived before the AI was identified can now be revealed.
            if (aiClients.size > known) scheduleRerender()
          }

          let raf: number | null = null
          let pruneTimer: ReturnType<typeof setTimeout> | null = null

          const rerender = () => {
            if (view.isDestroyed) return
            // Empty transaction: re-runs `decorations` so new entries paint and expired ones drop.
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
            if (transaction.local) return

            // A batch mixing several authors cannot be attributed run by run.
            const authors = transactionAuthors(transaction)
            if (authors.length !== 1) return

            const now = Date.now()
            dropExpired(now)

            const runs = events.flatMap(event => collectInsertedRuns(event, now, authors[0]))
            if (runs.length === 0) return

            entries.push(...runs)
            scheduleRerender()
            schedulePrune()
          }

          trackAiClients()
          awareness?.on('change', trackAiClients)
          fragment?.observeDeep(onChange)

          return {
            destroy: () => {
              awareness?.off('change', trackAiClients)
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
