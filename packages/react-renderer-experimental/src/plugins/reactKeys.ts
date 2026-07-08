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

interface OrphanedKey {
  key: string
  node: ProseMirrorNode
  used: boolean
}

/** A cheap bucket signature; exact matching is `node.eq` within the bucket. */
const nodeSignature = (node: ProseMirrorNode): string =>
  `${node.type.name}|${node.isText ? (node.text ?? '') : node.childCount}`

/**
 * Re-attaches keys whose positions the mapping reported as deleted, by
 * matching their old nodes against new-doc nodes that have no key yet.
 *
 * This exists for transactions that rewrite content wholesale instead of
 * editing in place — most importantly y-prosemirror, which applies every
 * remote change as a whole-document replace with freshly built nodes. Plain
 * position mapping drops every key there, remounting the entire document in
 * React (the collab "remount storm"). Two passes:
 *
 * 1. Content identity: equal nodes (via `node.eq`, bucketed by a cheap
 *    signature) re-adopt their old key, consumed in document order so
 *    repeated identical nodes pair up stably. This also lets keys survive
 *    cut-and-paste moves.
 * 2. Positional zip: remaining orphans and vacancies are paired in document
 *    order while their node types agree — the changed-in-place nodes (the
 *    actually edited paragraph) keep their identity too.
 *
 * Local in-place edits produce no orphans, so this costs nothing there.
 */
const rescueOrphanedKeys = (
  orphans: OrphanedKey[],
  next: ReactKeysPluginState,
  newDoc: ProseMirrorNode,
): void => {
  const buckets = new Map<string, OrphanedKey[]>()

  orphans.forEach(orphan => {
    const signature = nodeSignature(orphan.node)
    const bucket = buckets.get(signature)

    if (bucket) {
      bucket.push(orphan)
    } else {
      buckets.set(signature, [orphan])
    }
  })

  const vacancies: { pos: number; node: ProseMirrorNode }[] = []

  newDoc.descendants((node, pos) => {
    if (!next.posToKey.has(pos)) {
      vacancies.push({ pos, node })
    }
    return true
  })

  const adopt = (pos: number, orphan: OrphanedKey) => {
    orphan.used = true
    next.posToKey.set(pos, orphan.key)
    next.keyToPos.set(orphan.key, pos)
  }

  // Pass 1: exact content matches re-adopt their key
  const unmatched: { pos: number; node: ProseMirrorNode }[] = []

  vacancies.forEach(vacancy => {
    const bucket = buckets.get(nodeSignature(vacancy.node))
    const match = bucket?.find(orphan => !orphan.used && orphan.node.eq(vacancy.node))

    if (match) {
      adopt(vacancy.pos, match)
    } else {
      unmatched.push(vacancy)
    }
  })

  // Pass 2: zip the leftovers in document order while node types agree
  const leftovers = orphans.filter(orphan => !orphan.used)

  for (let i = 0; i < unmatched.length && i < leftovers.length; i += 1) {
    if (leftovers[i].node.type !== unmatched[i].node.type) {
      break
    }
    adopt(unmatched[i].pos, leftovers[i])
  }
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
  const orphans: OrphanedKey[] = []

  for (const [pos, key] of entries) {
    const override = meta?.overrides?.get(pos)
    const mapped =
      override === undefined ? tr.mapping.mapResult(pos) : { pos: override, deleted: false }

    if (mapped.deleted) {
      const node = oldState.doc.nodeAt(pos)

      if (node) {
        orphans.push({ key, node, used: false })
      }
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

  if (orphans.length) {
    rescueOrphanedKeys(orphans, next, newState.doc)
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
