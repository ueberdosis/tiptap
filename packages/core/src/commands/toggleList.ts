import { Fragment } from '@tiptap/pm/model'
import type { Node as ProseMirrorNode, NodeType } from '@tiptap/pm/model'
import type { Transaction } from '@tiptap/pm/state'
import { TextSelection } from '@tiptap/pm/state'
import { canJoin } from '@tiptap/pm/transform'

import { findParentNode } from '../helpers/findParentNode.js'
import { getNodeType } from '../helpers/getNodeType.js'
import { isList } from '../helpers/isList.js'
import type { RawCommands } from '../types.js'
import { convertListItems } from './utils/convertListItems.js'
import { findNodePosition } from './utils/findNodePosition.js'

/**
 * Normalise a list type attribute for comparison.
 * Treats null, undefined, and "1" as equivalent (the default numeric type).
 */
function normalizeListType(type: string | null | undefined): string | null {
  return !type || type === '1' ? null : type
}

/**
 * Check if two list type attributes are compatible for joining.
 * Lists can only join when they have the same type (both default, or both the same non-default type).
 */
function areListTypesCompatible(
  typeA: string | null | undefined,
  typeB: string | null | undefined,
): boolean {
  return normalizeListType(typeA) === normalizeListType(typeB)
}

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

  // Don't join if the type attributes are incompatible
  // (e.g. a default-type list should not merge with a type="a" list)
  if (!areListTypesCompatible(list.node.attrs.type, nodeBefore?.attrs.type)) {
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

  // Don't join if the type attributes are incompatible
  if (!areListTypesCompatible(list.node.attrs.type, nodeAfter?.attrs.type)) {
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

  // Move the root AllSelection into the list so liftListItem can operate
  // while preserving a valid text selection.
  const $start = doc.resolve(1)
  const $end = doc.resolve(list.nodeSize - 1)

  return TextSelection.between($start, $end)
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

    // Treat a sole top-level list selected with Ctrl/Cmd+A as the active list,
    // since findParentNode cannot detect it from the document root.
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

    const isInsideExistingList =
      !!parentList && range.depth >= 1 && range.depth - parentList.depth <= 1

    const hasWholeDocSelectedList = !!allSelectionList
    if ((isInsideExistingList || hasWholeDocSelectedList) && currentList) {
      // remove list
      if (currentList.node.type === listType) {
        if (isAllSelection && hasWholeDocSelectedList) {
          return chain()
            .command(({ tr: trx, dispatch: disp }) => {
              // Move the root AllSelection into the list before lifting it.
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

      // change list type: same item type (e.g., bulletList to orderedList)
      if (
        isList(currentList.node.type.name, extensions) &&
        listType.validContent(currentList.node.content)
      ) {
        return chain()
          .command(() => {
            tr.setNodeMarkup(currentList.pos, listType)

            return true
          })
          .command(() => joinListBackwards(tr, listType))
          .command(() => joinListForwards(tr, listType))
          .run()
      }

      // change list type: cross-item-type conversion
      // Handles cases like bulletList(listItem) to taskList(taskItem)
      // where the list item type differs between source and target lists.
      if (isList(currentList.node.type.name, extensions)) {
        const currentItemType = currentList.node.firstChild?.type

        if (currentItemType && currentItemType !== itemType) {
          const convertedItems = convertListItems(currentList.node, {
            listType,
            itemType,
            isListNode: node => isList(node.type.name, extensions),
          })

          const convertedContent = convertedItems ? Fragment.from(convertedItems) : null

          if (!convertedContent || !listType.validContent(convertedContent)) {
            return false
          }

          return chain()
            .command(() => {
              const { $anchor, $head } = tr.selection
              const anchorParent = $anchor.parent
              const headParent = $head.parent
              const anchorOffset = $anchor.parentOffset
              const headOffset = $head.parentOffset
              let newList: ProseMirrorNode

              try {
                newList = listType.create(attributes, convertedContent)
              } catch {
                return false
              }

              tr.replaceWith(currentList.pos, currentList.pos + currentList.node.nodeSize, newList)

              if (anchorParent.inlineContent && headParent.inlineContent) {
                const anchorParentPos = findNodePosition(newList, anchorParent)
                const headParentPos = findNodePosition(newList, headParent)

                if (anchorParentPos !== null && headParentPos !== null) {
                  const anchor = currentList.pos + anchorParentPos + 2 + anchorOffset
                  const head = currentList.pos + headParentPos + 2 + headOffset

                  tr.setSelection(TextSelection.create(tr.doc, anchor, head))
                }
              }

              return true
            })
            .command(() => joinListBackwards(tr, listType))
            .command(() => joinListForwards(tr, listType))
            .run()
        }
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
