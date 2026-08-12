import type { Selection } from '@tiptap/pm/state'
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
export function isProseMirrorCellSelection(
  selection: Selection | null | undefined,
): selection is CellSelection {
  return (
    selection !== null &&
    selection !== undefined &&
    'forEachCell' in selection &&
    typeof selection.forEachCell === 'function'
  )
}
