import type { NodeType } from '@tiptap/pm/model'
import type { Transaction } from '@tiptap/pm/state'
import { TextSelection } from '@tiptap/pm/state'
import { canJoin } from '@tiptap/pm/transform'

import { findParentNode } from '../helpers/findParentNode.js'
import { getNodeType } from '../helpers/getNodeType.js'
import { isList } from '../helpers/isList.js'
import type { RawCommands } from '../types.js'

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
      toggleList: (
        listTypeOrName: string | NodeType,
        itemTypeOrName: string | NodeType,
        keepMarks?: boolean,
        attributes?: Record<string, any>,
      ) => ReturnType
    }
  }
}

function createInnerSelectionForWholeDocList(tr: Transaction) {
  const doc = tr.doc
  const list = doc.firstChild

  if (!list) {
    return null
  }

  // Place the selection inside the list node so that ProseMirror's
  // liftListItem command can operate. AllSelection sits at the doc root.
  const from = 1
  const to = list.nodeSize - 1

  return TextSelection.create(doc, from, to)
}
export const toggleList: RawCommands['toggleList'] =
  (listTypeOrName, itemTypeOrName, keepMarks, attributes = {}) =>
  ({ editor, tr, state, dispatch, chain, commands, can }) => {
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

    // When the user presses Ctrl/Cmd+A, ProseMirror creates an `AllSelection`
    // covering the entire document (0..doc.content.size). In that case
    // `findParentNode` cannot detect the surrounding list because the
    // selection sits at the document root. If the document consists of a
    // single top-level list node, treat that list as the active list so the
    // toggle logic can correctly lift or change it.
    const isAllSelection = selection.from === 0 && selection.to === state.doc.content.size
    const topLevelNodes = state.doc.content.content
    const soleTopLevelNode = topLevelNodes.length === 1 ? topLevelNodes[0] : null
    const allSelectionList =
      isAllSelection && soleTopLevelNode && isList(soleTopLevelNode.type.name, extensions)
        ? {
            node: soleTopLevelNode,
            pos: 0,
            depth: 0,
          }
        : null

    const currentList = parentList ?? allSelectionList

    const isInsideExistingList = !!parentList && range.depth >= 1 && range.depth - parentList.depth <= 1

    const hasWholeDocSelectedList = !!allSelectionList
    if ((isInsideExistingList || hasWholeDocSelectedList) && currentList) {
      // remove list
      if (currentList.node.type === listType) {
        if (isAllSelection && hasWholeDocSelectedList) {
          return chain()
            .command(({ tr: trx, dispatch: disp }) => {
              // Ctrl/Cmd+A creates an AllSelection at the document root.
              // When the whole document is a single top-level list, normalize the
              // selection into that list before lifting, since liftListItem expects
              // a selection inside a list item.
              const nextSelection = createInnerSelectionForWholeDocList(trx)

              if (!nextSelection) {
                return false
              }

              trx.setSelection(nextSelection)

              if (disp) {
                disp(trx)
              }

              return true
            })
            .liftListItem(itemType)
            .run()
        }

        return commands.liftListItem(itemType)
      }

      // change list type
      if (isList(currentList.node.type.name, extensions) && listType.validContent(currentList.node.content)) {
        return chain()
          .command(() => {
            tr.setNodeMarkup(currentList.pos, listType)

            return true
          })
          .command(() => joinListBackwards(tr, listType))
          .command(() => joinListForwards(tr, listType))
          .run()
      }
    }

    if (!keepMarks || !marks || !dispatch) {
      return (
        chain()
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
      )
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
