import type { NodeSelection } from '@tiptap/pm/state'

/**
 * Check whether a selection exposes a selected node.
 *
 * @param selection - Selection to inspect.
 * @returns Whether the selection is a node selection.
 * @example ```js
 * isProseMirrorNodeSelection(editor.state.selection)
 * ```
 */
export function isProseMirrorNodeSelection(selection: unknown): selection is NodeSelection {
  if (selection === null || typeof selection !== 'object') {
    return false
  }

  return 'node' in selection && selection.node != null
}
