import type { Editor } from './Editor.js'
import type { MappablePosition } from './helpers/MappablePosition.js'
import { nodeAt } from './helpers/nodeAt.js'
import type { EditorEvents } from './types.js'

export interface VisualSelectionSnapshot {
  /**
   * The absolute position of the visually selected node.
   */
  pos: number
  /**
   * The size of the visually selected node.
   */
  nodeSize: number
}

/**
 * Visual-only node selection, kept outside `state.selection`. Clears
 * itself when the real selection changes.
 *
 * @example
 * ```js
 * editor.visualSelection.set(pos)
 * editor.visualSelection.subscribe(() => {
 *   console.log(editor.visualSelection.getSnapshot())
 * })
 * ```
 */
export class VisualSelectionStore {
  private editor: Editor

  private mappablePosition: MappablePosition | null = null

  private snapshot: VisualSelectionSnapshot | null = null

  private subscribers = new Set<() => void>()

  constructor(editor: Editor) {
    this.editor = editor

    editor.on('transaction', this.handleTransaction)
    editor.on('selectionUpdate', this.handleSelectionUpdate)
  }

  /**
   * The current visual selection, or `null` if nothing is visually selected.
   */
  getSnapshot = (): VisualSelectionSnapshot | null => {
    return this.snapshot
  }

  /**
   * Marks the node at `pos` as visually selected.
   */
  set(pos: number): void {
    const node = nodeAt(this.editor.state.doc, pos)

    if (!node) {
      this.clear()
      return
    }

    this.mappablePosition = this.editor.utils.createMappablePosition(pos)
    this.notify({ pos, nodeSize: node.nodeSize })
  }

  /**
   * Clears the visual selection.
   */
  clear(): void {
    this.mappablePosition = null
    this.notify(null)
  }

  /**
   * Subscribes to visual selection changes. Compatible with `useSyncExternalStore`.
   */
  subscribe = (callback: () => void): (() => void) => {
    this.subscribers.add(callback)
    return () => {
      this.subscribers.delete(callback)
    }
  }

  destroy(): void {
    this.editor.off('transaction', this.handleTransaction)
    this.editor.off('selectionUpdate', this.handleSelectionUpdate)
    this.subscribers.clear()
  }

  private notify(snapshot: VisualSelectionSnapshot | null): void {
    const unchanged =
      snapshot === null
        ? this.snapshot === null
        : this.snapshot?.pos === snapshot.pos && this.snapshot?.nodeSize === snapshot.nodeSize

    if (unchanged) {
      return
    }

    this.snapshot = snapshot
    this.subscribers.forEach(callback => callback())
  }

  // Avoid a stale visual selection next to a new real one.
  private handleSelectionUpdate = () => {
    this.clear()
  }

  private handleTransaction = ({ transaction }: EditorEvents['transaction']) => {
    if (!this.mappablePosition || !transaction.docChanged) {
      return
    }

    const { position, mapResult } = this.editor.utils.getUpdatedPosition(
      this.mappablePosition,
      transaction,
    )
    const node = mapResult?.deleted ? null : nodeAt(transaction.doc, position.position)

    if (!node) {
      this.clear()
      return
    }

    this.mappablePosition = position
    this.notify({ pos: position.position, nodeSize: node.nodeSize })
  }
}
