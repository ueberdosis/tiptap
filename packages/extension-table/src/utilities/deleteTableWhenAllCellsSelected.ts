import { findParentNodeClosestToPos, KeyboardShortcutCommand } from '@tiptap/core'

import { isCellSelection } from './isCellSelection'

export const deleteTableWhenAllCellsSelected: KeyboardShortcutCommand = ({ editor }) => {
  const { selection } = editor.state

  if (!isCellSelection(selection)) {
    return false
  }

  let cellCount = 0
  const table = findParentNodeClosestToPos(selection.ranges[0].$from, node => {
    return node.type.name === 'table'
  })

  table?.node.descendants(node => {
    if (node.type.name === 'table') {
      return false
    }

    if (['tableCell', 'tableHeader'].includes(node.type.name)) {
      cellCount += 1
    }
  })

  const allCellsSelected = cellCount === selection.ranges.length

  if (!allCellsSelected) {
    return false
  }

  editor.commands.deleteTable()

  return true
}
