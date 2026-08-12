import type { NodeSelection, Selection } from '@tiptap/pm/state'

/**
 * Check whether a selection exposes a selected node.
 *
 * @param selection - Selection to inspect.
 * @returns Whether the selection is a node selection.
 */
export function isProseMirrorNodeSelection(selection: Selection): selection is NodeSelection {
  return 'node' in selection && selection.node !== null
}
