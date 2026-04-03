import type { NodeType } from '@tiptap/pm/model'
import { liftListItem as originalLiftListItem } from '@tiptap/pm/schema-list'
import type { Transaction } from '@tiptap/pm/state'
import { AllSelection, TextSelection } from '@tiptap/pm/state'
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

export const toggleList: RawCommands['toggleList'] =
  (listTypeOrName, itemTypeOrName, keepMarks, attributes = {}) =>
  ({ editor, tr, state, dispatch, chain, commands, can }) => {
    const { extensions, splittableMarks } = editor.extensionManager
    const listType = getNodeType(listTypeOrName, state.schema)
    const itemType = getNodeType(itemTypeOrName, state.schema)
    const { storedMarks } = state
    let { selection } = state
    let { $from, $to } = selection

    // Special handling for AllSelection (Cmd+A) which includes trailing nodes
    // When AllSelection is used and we're toggling off a list, adjust selection to exclude trailing paragraph
    if (selection instanceof AllSelection) {
      const firstChild = state.doc.firstChild
      const lastChild = state.doc.lastChild

      // Check if first child is a list of the same type we're toggling
      if (firstChild && firstChild.type === listType) {
        // Check if there's a trailing empty paragraph after the list
        const hasTrailingEmptyParagraph =
          lastChild && lastChild !== firstChild && lastChild.type.name === 'paragraph' && lastChild.content.size === 0

        // If there's a trailing paragraph, adjust selection to only cover the list
        if (hasTrailingEmptyParagraph) {
          // Find the first text position inside the list
          const listStart = 1
          const listEnd = firstChild.nodeSize

          // Find first valid text position inside the list
          let firstTextPos = listStart + 1
          let foundTextPos = false

          // Traverse to find the first position with inline content
          state.doc.nodesBetween(listStart, listEnd, (node, pos) => {
            if (!foundTextPos && node.isTextblock) {
              firstTextPos = pos + 1
              foundTextPos = true
              return false
            }
          })

          if (foundTextPos) {
            // Find the last valid text position inside the list
            let lastTextPos = firstTextPos

            state.doc.nodesBetween(listStart, listEnd, (node, pos) => {
              if (node.isTextblock) {
                lastTextPos = pos + node.nodeSize - 1
              }
            })

            // Create a new selection from the start to the end of list content
            try {
              const newSelection = TextSelection.create(state.doc, firstTextPos, lastTextPos)

              // Update the selection variables that will be used in the rest of the function
              selection = newSelection
              $from = newSelection.$from
              $to = newSelection.$to
            } catch {
              // If selection creation fails, continue with original selection
            }
          }
        }
      }
    }

    const range = $from.blockRange($to)

    const marks = storedMarks || (selection.$to.parentOffset && selection.$from.marks())

    if (!range) {
      return false
    }

    const parentList = findParentNode(node => isList(node.type.name, extensions))(selection)

    if (range.depth >= 1 && parentList && range.depth - parentList.depth <= 1) {
      // remove list
      if (parentList.node.type === listType) {
        // Use chain to set selection and then lift
        return chain()
          .command(({ tr: chainTr, dispatch: chainDispatch }) => {
            if (chainDispatch) {
              chainTr.setSelection(selection)
            }
            return true
          })
          .command(({ state: chainState, dispatch: chainDispatch }) => {
            return originalLiftListItem(itemType)(chainState, chainDispatch)
          })
          .run()
      }

      // change list type
      if (isList(parentList.node.type.name, extensions) && listType.validContent(parentList.node.content) && dispatch) {
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
