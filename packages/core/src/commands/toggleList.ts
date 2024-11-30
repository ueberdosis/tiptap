import { NodeType } from '@tiptap/pm/model'
import { Transaction } from '@tiptap/pm/state'
import { canJoin } from '@tiptap/pm/transform'

import { findParentNode } from '../helpers/findParentNode.js'
import { getNodeType } from '../helpers/getNodeType.js'
import { isList } from '../helpers/isList.js'
import { RawCommands } from '../types.js'

const joinListBackwards = (tr: Transaction, listType: NodeType): boolean => {
  const list = findParentNode(node => node.type === listType)(tr.selection)

  if (!list) {
    return true
  }

  const before = tr.doc.resolve(Math.max(0, list.pos - 1)).before(list.depth)

  if (before === undefined) {
    return true
  }

  const nodeBefore = tr.doc.nodeAt(before)
  const canJoinBackwards = list.node.type === nodeBefore?.type && canJoin(tr.doc, list.pos)

  if (!canJoinBackwards) {
    return true
  }

  tr.join(list.pos)

  return true
}

const joinListForwards = (tr: Transaction, listType: NodeType): boolean => {
  const list = findParentNode(node => node.type === listType)(tr.selection)

  if (!list) {
    return true
  }

  const after = tr.doc.resolve(list.start).after(list.depth)

  if (after === undefined) {
    return true
  }

  const nodeAfter = tr.doc.nodeAt(after)
  const canJoinForwards = list.node.type === nodeAfter?.type && canJoin(tr.doc, after)

  if (!canJoinForwards) {
    return true
  }

  tr.join(after)

  return true
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    toggleList: {
      /**
       * Toggle between different list types.
       * @param listTypeOrName The type or name of the list.
       * @param itemTypeOrName The type or name of the list item.
       * @param keepMarks Keep marks when toggling.
       * @param attributes Attributes for the new list.
       * @example editor.commands.toggleList('bulletList', 'listItem')
       */
      toggleList: (listTypeOrName: string | NodeType, itemTypeOrName: string | NodeType, keepMarks?: boolean, attributes?: Record<string, any>) => ReturnType;
    }
  }
}

export const toggleList: RawCommands['toggleList'] = (listTypeOrName, itemTypeOrName, keepMarks, attributes = {}) => ({
  editor, tr, state, dispatch, chain, commands, can,
}) => {
  const { extensions, splittableMarks } = editor.extensionManager
  const listType = getNodeType(listTypeOrName, state.schema)
  const itemType = getNodeType(itemTypeOrName, state.schema)
  const { selection, storedMarks } = state
  const { $from, $to } = selection
  const range = $from.blockRange($to)

  const marks = storedMarks || (selection.$to.parentOffset && selection.$from.marks())

  if (!range) {
    return false
  }

  const parentList = findParentNode(node => isList(node.type.name, extensions))(selection)

  if (range.depth >= 1 && parentList && range.depth - parentList.depth <= 1) {
    // remove list
    if (parentList.node.type === listType) {
      return commands.liftListItem(itemType)
    }

    // change list type
    if (
      isList(parentList.node.type.name, extensions)
        && listType.validContent(parentList.node.content)
        && dispatch
    ) {
      return chain()
        .command(() => {
          tr.setNodeMarkup(parentList.pos, listType)

          return true
        })
        .command(() => joinListBackwards(tr, listType))
        .command(() => joinListForwards(tr, listType))
        .run()
    }
  }
  if (!keepMarks || !marks || !dispatch) {

    return chain()
      // try to convert node to default node if needed
      .command(() => {
        const canWrapInList = can().wrapInList(listType, attributes)

        if (canWrapInList) {
          return true
        }

        return commands.clearNodes()
      })
      .wrapInList(listType, attributes)
      .command(() => joinListBackwards(tr, listType))
      .command(() => joinListForwards(tr, listType))
      .run()
  }

  return (
    chain()
    // try to convert node to default node if needed
      .command(() => {
        const canWrapInList = can().wrapInList(listType, attributes)

        const filteredMarks = marks.filter(mark => splittableMarks.includes(mark.type.name))

        tr.ensureMarks(filteredMarks)

        if (canWrapInList) {
          return true
        }

        return commands.clearNodes()
      })
      .wrapInList(listType, attributes)
      .command(() => joinListBackwards(tr, listType))
      .command(() => joinListForwards(tr, listType))
      .run()
  )
}
