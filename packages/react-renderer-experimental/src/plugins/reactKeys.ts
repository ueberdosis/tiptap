import type { Node as ProseMirrorNode } from '@tiptap/pm/model'
import type { EditorState, Transaction } from '@tiptap/pm/state'
import { Plugin, PluginKey } from '@tiptap/pm/state'

export interface ReactKeysPluginState {
  /** Stable key for the node starting at each document position. */
  posToKey: Map<number, string>
  /** Inverse of `posToKey`. */
  keyToPos: Map<string, number>
  /**
   * Position of a block whose rendering is frozen (used by the IME
   * composition guard). Mapped forward across transactions; cleared when the
   * block itself changes outside a composition.
   */
  freezeFrom: number | null
}

export interface ReactKeysPluginMeta {
  /**
   * Explicit position remaps (old position → new position) that replace the
   * transaction mapping for those entries. Used by `reorderSiblings`, where
   * plain mapping would report the moved nodes as deleted.
   */
  overrides?: Map<number, number>
  /** Sets or clears `freezeFrom` directly, instead of mapping it forward. */
  freezeFrom?: number | null
}

export const reactKeysPluginKey = new PluginKey<ReactKeysPluginState>('tiptapReactKeys')

let nodeKeyCounter = 0

/** Mints a session-unique key for a rendered node. */
export const createNodeKey = (): string => `node-${nodeKeyCounter++}`

/** Assigns fresh keys to every node that has none yet (text nodes included). */
const assignFreshKeys = (doc: ProseMirrorNode, state: ReactKeysPluginState): void => {
  doc.descendants((_node, pos) => {
    if (!state.posToKey.has(pos)) {
      const key = createNodeKey()

      state.posToKey.set(pos, key)
      state.keyToPos.set(key, pos)
    }
    return true
  })
}

const resolveFreezeFrom = (
  meta: ReactKeysPluginMeta | undefined,
  prev: ReactKeysPluginState,
  tr: Transaction,
  oldState: EditorState,
  newState: EditorState,
): number | null => {
  // An explicit meta value is the caller's decision; never second-guess it
  if (meta?.freezeFrom !== undefined) {
    return meta.freezeFrom
  }
  if (prev.freezeFrom === null) {
    return null
  }

  const next = tr.mapping.map(prev.freezeFrom, -1)

  // "composition" is the meta prosemirror-view sets on transactions it
  // dispatches during an active IME composition, where the freeze must hold
  if (tr.getMeta('composition') != null) {
    return next
  }

  const oldBlock = oldState.doc.nodeAt(prev.freezeFrom)
  const newBlock = newState.doc.nodeAt(next)

  // The frozen block was deleted or changed outside a composition: stale
  if (!newBlock || !oldBlock?.eq(newBlock)) {
    return null
  }
  return next
}

const applyKeys = (
  tr: Transaction,
  prev: ReactKeysPluginState,
  oldState: EditorState,
  newState: EditorState,
): ReactKeysPluginState => {
  const meta = tr.getMeta(reactKeysPluginKey) as ReactKeysPluginMeta | undefined
  const freezeFrom = resolveFreezeFrom(meta, prev, tr, oldState, newState)

  if (!tr.docChanged) {
    return freezeFrom === prev.freezeFrom ? prev : { ...prev, freezeFrom }
  }

  const next: ReactKeysPluginState = {
    posToKey: new Map(),
    keyToPos: new Map(),
    freezeFrom,
  }

  // Sorted ascending so that when two old positions map onto the same new
  // position (e.g. a join), the later node wins the slot deterministically
  const entries = [...prev.posToKey.entries()].sort(([a], [b]) => a - b)

  for (const [pos, key] of entries) {
    const override = meta?.overrides?.get(pos)
    const mapped =
      override === undefined ? tr.mapping.mapResult(pos) : { pos: override, deleted: false }

    if (mapped.deleted) {
      continue
    }

    // If another key already won this position, evict it so keyToPos stays
    // the exact inverse of posToKey
    const displaced = next.posToKey.get(mapped.pos)

    if (displaced !== undefined) {
      next.keyToPos.delete(displaced)
    }
    next.posToKey.set(mapped.pos, key)
    next.keyToPos.set(key, mapped.pos)
  }

  assignFreshKeys(newState.doc, next)
  return next
}

/**
 * Tracks a stable key per node (text nodes included, so text runs survive
 * sibling insertions) across transactions, addressable by the node's current
 * position and back. The rendering layer uses these as React `key`s so edits
 * reuse component instances instead of remounting.
 */
export const reactKeys = (): Plugin<ReactKeysPluginState> =>
  new Plugin<ReactKeysPluginState>({
    key: reactKeysPluginKey,
    state: {
      init: (_, state) => {
        const initial: ReactKeysPluginState = {
          posToKey: new Map(),
          keyToPos: new Map(),
          freezeFrom: null,
        }

        assignFreshKeys(state.doc, initial)
        return initial
      },
      apply: applyKeys,
    },
  })
