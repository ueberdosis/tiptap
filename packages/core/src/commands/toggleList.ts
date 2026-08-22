import type { Node as ProseMirrorNode, NodeType } from '@tiptap/pm/model'
import { Fragment } from '@tiptap/pm/model'
import type { Transaction } from '@tiptap/pm/state'
import { TextSelection } from '@tiptap/pm/state'
import { canJoin } from '@tiptap/pm/transform'

import { findParentNode } from '../helpers/findParentNode.js'
import { getNodeType } from '../helpers/getNodeType.js'
import { isList } from '../helpers/isList.js'
import type { Extensions, RawCommands } from '../types.js'

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

/**
 * Rebuild a list node from a different item family (e.g. a taskList whose
 * items are taskItem nodes) into `listType` with `itemType` items,
 * recursively converting nested lists inside its items as well.
 *
 * This is needed because `tr.setNodeMarkup` can only swap a node's own type;
 * when the list families differ, the item nodes themselves are incompatible
 * node types (taskItem vs listItem have different specs and attributes), so
 * the whole subtree has to be recreated node by node.
 *
 * Returns `null` when the rebuilt content would not fit the target content
 * models, so callers can leave the original node untouched instead of
 * producing an invalid document. Family-specific item attributes with no
 * equivalent on the target item type (e.g. taskItem's `checked`) are
 * intentionally dropped — a bullet list has no checked state to carry them.
 */
function rebuildListNode(
  node: ProseMirrorNode,
  listType: NodeType,
  itemType: NodeType,
  extensions: Extensions,
): ProseMirrorNode | null {
  const newItems: ProseMirrorNode[] = []

  for (let itemIndex = 0; itemIndex < node.childCount; itemIndex += 1) {
    const item = node.child(itemIndex)
    const newChildren: ProseMirrorNode[] = []

    for (let childIndex = 0; childIndex < item.childCount; childIndex += 1) {
      const child = item.child(childIndex)

      if (isList(child.type.name, extensions) && child.type !== listType) {
        newChildren.push(rebuildListNode(child, listType, itemType, extensions) ?? child)
      } else {
        newChildren.push(child)
      }
    }

    const itemContent = Fragment.from(newChildren)

    if (!itemType.validContent(itemContent)) {
      return null
    }

    newItems.push(
      itemType.create(item.type === itemType ? item.attrs : null, itemContent, item.marks),
    )
  }

  const listContent = Fragment.from(newItems)

  if (!listType.validContent(listContent)) {
    return null
  }

  return listType.create(null, listContent)
}

/**
 * `tr.setNodeMarkup` only changes the type of the single node at the given
 * position. When a list contains nested sublists, only the outermost list
 * node was being converted, leaving nested sublists on their original type
 * and breaking the visual hierarchy. This walks the whole list subtree and
 * converts every nested list node that is not already `listType`:
 *
 * - same item family (bulletList <-> orderedList): the existing items are
 *   already valid inside the target list, so only the list wrapper's type
 *   is swapped via `setNodeMarkup`, and the walk keeps descending.
 * - different item family (taskList <-> bulletList/orderedList): the item
 *   node types are incompatible, so the whole subtree is rebuilt in one go
 *   via `rebuildListNode` and replaced; the walk skips its interior since
 *   the rebuild already handled any deeper nesting.
 *
 * Every conversion here is size-preserving (setNodeMarkup never changes
 * sizes; the rebuild keeps the exact node structure and only swaps wrapper
 * types), so all positions collected against the unmutated doc stay valid
 * for the whole pass.
 */
function convertNestedLists(
  tr: Transaction,
  listPos: number,
  listType: NodeType,
  itemType: NodeType,
  extensions: Extensions,
): void {
  const listNode = tr.doc.nodeAt(listPos)

  if (!listNode) {
    return
  }

  const sameFamilyPositions: number[] = []
  const crossFamilyNodes: { pos: number; node: ProseMirrorNode }[] = []

  listNode.descendants((node, relativePos) => {
    if (!isList(node.type.name, extensions) || node.type === listType) {
      return true
    }

    const pos = listPos + 1 + relativePos

    if (listType.validContent(node.content)) {
      sameFamilyPositions.push(pos)
      return true
    }

    crossFamilyNodes.push({ pos, node })
    return false
  })

  for (const pos of sameFamilyPositions) {
    tr.setNodeMarkup(pos, listType)
  }

  for (const { pos, node } of crossFamilyNodes) {
    const rebuilt = rebuildListNode(node, listType, itemType, extensions)

    if (rebuilt) {
      tr.replaceWith(pos, pos + node.nodeSize, rebuilt)
    }
  }
}

/**
 * Convert nested lists inside every `listType` list overlapping the current
 * selection. Used after the `wrapInList` fallback path (taken for
 * cross-family toggles like bulletList -> taskList, where the target list
 * cannot hold the current items directly): `wrapInList` + `clearNodes`
 * produce the correct top-level list, but any sublist nested inside the
 * original items survives untouched on its old type.
 */
function convertNestedListsInSelection(
  tr: Transaction,
  listType: NodeType,
  itemType: NodeType,
  extensions: Extensions,
): void {
  const { from, to } = tr.selection
  const listPositions: number[] = []

  tr.doc.nodesBetween(from, to, (node, pos) => {
    if (node.type === listType) {
      listPositions.push(pos)
      return false
    }

    return true
  })

  // All conversions are size-preserving, so positions collected up front
  // remain valid across the whole loop.
  listPositions.forEach(pos => convertNestedLists(tr, pos, listType, itemType, extensions))
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
            convertNestedLists(tr, currentList.pos, listType, itemType, extensions)

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
          .command(() => {
            convertNestedListsInSelection(tr, listType, itemType, extensions)

            return true
          })
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
        .command(() => {
          convertNestedListsInSelection(tr, listType, itemType, extensions)

          return true
        })
        .command(() => joinListBackwards(tr, listType))
        .command(() => joinListForwards(tr, listType))
        .run()
    )
  }
