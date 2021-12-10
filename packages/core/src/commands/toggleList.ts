import { NodeType } from 'prosemirror-model'
import { Transaction } from 'prosemirror-state'
import { canJoin } from 'prosemirror-transform'
import { RawCommands } from '../types'
import { getNodeType } from '../helpers/getNodeType'
import { findParentNode } from '../helpers/findParentNode'
import { isList } from '../helpers/isList'

const joinListBackwards = (tr: Transaction, listType: NodeType): boolean => {
  const list = findParentNode(node => node.type === listType)(tr.selection)

  if (!list) {
    return true
  }

  const before = tr.doc.resolve(Math.max(0, list.pos - 1)).before(list.depth)
  const nodeBefore = tr.doc.nodeAt(before)
  const canJoinBackwards = list.node.type === nodeBefore?.type
    && canJoin(tr.doc, list.pos)

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
  const nodeAfter = tr.doc.nodeAt(after)
  const canJoinForwards = list.node.type === nodeAfter?.type
    && canJoin(tr.doc, after)

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
       */
      toggleList: (listTypeOrName: string | NodeType, itemTypeOrName: string | NodeType) => ReturnType,
    }
  }
}

export const toggleList: RawCommands['toggleList'] = (listTypeOrName, itemTypeOrName) => ({
  editor, tr, state, dispatch, chain, commands, can,
}) => {
  const { extensions } = editor.extensionManager
  const listType = getNodeType(listTypeOrName, state.schema)
  const itemType = getNodeType(itemTypeOrName, state.schema)
  const { selection } = state
  const { $from, $to } = selection
  const range = $from.blockRange($to)

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

  return chain()
    // try to convert node to default node if needed
    .command(() => {
      const canWrapInList = can().wrapInList(listType)

      if (canWrapInList) {
        return true
      }

      return commands.clearNodes()
    })
    .wrapInList(listType)
    .command(() => joinListBackwards(tr, listType))
    .command(() => joinListForwards(tr, listType))
    .run()
}
