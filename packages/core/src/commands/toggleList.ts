import type { NodeType } from '@tiptap/pm/model'
import type { Transaction } from '@tiptap/pm/state'
import { TextSelection } from '@tiptap/pm/state'
import { canJoin } from '@tiptap/pm/transform'

import { findParentNode } from '../helpers/findParentNode.js'
import { getNodeType } from '../helpers/getNodeType.js'
import { isList } from '../helpers/isList.js'
import type { RawCommands } from '../types.js'

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

  // Place the selection inside the list node so that ProseMirror's
  // liftListItem command can operate. AllSelection sits at the doc root.
  // Use TextSelection.between to resolve positions into valid inline
  // content positions, so the selection survives position mapping after
  // liftListItem removes list/item wrappers.
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

    // A table `CellSelection` (multiple cells selected at once) exposes one
    // `SelectionRange` per selected cell through `selection.ranges`, but its
    // `$from`/`$to` resolve to the first cell only (prosemirror-tables builds it
    // with `super(ranges[0].$from, ranges[0].$to, ranges)`). The single-range
    // logic below therefore toggled just the first selected cell. When more than
    // one range is selected, toggle each range independently so every selected
    // cell is affected, reusing the exact same per-cell logic (wrap / lift /
    // change type). Ranges are processed from the last document position to the
    // first so that edits to later cells do not shift the positions of earlier,
    // not-yet-processed cells.
    if (selection.ranges.length > 1) {
      const cellRanges = selection.ranges
        .map(selectionRange => ({ from: selectionRange.$from.pos, to: selectionRange.$to.pos }))
        .sort((a, b) => b.from - a.from)

      const listChain = chain()

      cellRanges.forEach(({ from, to }) => {
        listChain
          .command(({ tr: cellTr }) => {
            // Resolve against the current transaction doc so positions stay valid
            // as earlier iterations mutate later cells.
            const $cellFrom = cellTr.doc.resolve(from)
            const $cellTo = cellTr.doc.resolve(to)

            cellTr.setSelection(TextSelection.between($cellFrom, $cellTo))

            return true
          })
          .toggleList(listTypeOrName, itemTypeOrName, keepMarks, attributes)
      })

      return listChain.run()
    }

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

    const isInsideExistingList =
      !!parentList && range.depth >= 1 && range.depth - parentList.depth <= 1

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
