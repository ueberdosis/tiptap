import { Extension } from '@tiptap/core'

import { handleDeleteBranchingNestedList } from './handleDeleteBranchingNestedList.js'

/**
 * Creates a high-priority keymap extension that handles Delete for branching nested lists.
 * Kept separate from the list item node so Enter/Tab shortcuts keep their default priority.
 */
export const createBranchingListDeleteKeymap = (itemName: string, wrapperNames: string[]) => {
  return Extension.create({
    name: `${itemName}BranchingDeleteKeymap`,
    priority: 101,

    addKeyboardShortcuts() {
      const handleDelete = () =>
        handleDeleteBranchingNestedList(this.editor, itemName, wrapperNames)

      return {
        Delete: handleDelete,
        'Mod-Delete': handleDelete,
      }
    },
  })
}
