import type { CellSelection } from '@tiptap/pm/tables'

/**
 * Check whether a selection provides the cell-iteration API.
 *
 * @param selection - Selection to inspect.
 * @returns Whether the selection is a table cell selection.
 * @example ```js
 * isProseMirrorCellSelection(editor.state.selection)
 * ```
 */
export function isProseMirrorCellSelection(selection: unknown): selection is CellSelection {
  if (selection === null || typeof selection !== 'object') {
    return false
  }

  return 'forEachCell' in selection && typeof selection.forEachCell === 'function'
}
