import {
  Fragment,
  Node as ProseMirrorNode,
  NodeType,
  Slice,
} from 'prosemirror-model'
import { TextSelection } from 'prosemirror-state'
import { canSplit } from 'prosemirror-transform'

import { getNodeType } from '../helpers/getNodeType'
import { getSplittedAttributes } from '../helpers/getSplittedAttributes'
import { RawCommands } from '../types'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    splitListItem: {
      /**
       * Splits one list item into two list items.
       */
      splitListItem: (typeOrName: string | NodeType) => ReturnType,
    }
  }
}

export const splitListItem: RawCommands['splitListItem'] = typeOrName => ({
  tr, state, dispatch, editor,
}) => {
  const type = getNodeType(typeOrName, state.schema)
  const { $from, $to } = state.selection

  // @ts-ignore
  // eslint-disable-next-line
  const node: ProseMirrorNode = state.selection.node

  if ((node && node.isBlock) || $from.depth < 2 || !$from.sameParent($to)) {
    return false
  }

  const grandParent = $from.node(-1)

  if (grandParent.type !== type) {
    return false
  }

  const extensionAttributes = editor.extensionManager.attributes

  if ($from.parent.content.size === 0 && $from.node(-1).childCount === $from.indexAfter(-1)) {
    // In an empty block. If this is a nested list, the wrapping
    // list item should be split. Otherwise, bail out and let next
    // command handle lifting.
    if (
      $from.depth === 2
      || $from.node(-3).type !== type
      || $from.index(-2) !== $from.node(-2).childCount - 1
    ) {
      return false
    }

    if (dispatch) {
      let wrap = Fragment.empty
      // eslint-disable-next-line
      const depthBefore = $from.index(-1)
        ? 1
        : $from.index(-2)
          ? 2
          : 3

      // Build a fragment containing empty versions of the structure
      // from the outer list item to the parent node of the cursor
      for (let d = $from.depth - depthBefore; d >= $from.depth - 3; d -= 1) {
        wrap = Fragment.from($from.node(d).copy(wrap))
      }

      // eslint-disable-next-line
      const depthAfter = $from.indexAfter(-1) < $from.node(-2).childCount
        ? 1
        : $from.indexAfter(-2) < $from.node(-3).childCount
          ? 2
          : 3

      // Add a second list item with an empty default start node
      const newNextTypeAttributes = getSplittedAttributes(
        extensionAttributes,
        $from.node().type.name,
        $from.node().attrs,
      )
      const nextType = type.contentMatch.defaultType?.createAndFill(newNextTypeAttributes) || undefined

      wrap = wrap.append(Fragment.from(type.createAndFill(null, nextType) || undefined))

      const start = $from.before($from.depth - (depthBefore - 1))

      tr.replace(start, $from.after(-depthAfter), new Slice(wrap, 4 - depthBefore, 0))

      let sel = -1

      tr.doc.nodesBetween(start, tr.doc.content.size, (n, pos) => {
        if (sel > -1) {
          return false
        }

        if (n.isTextblock && n.content.size === 0) {
          sel = pos + 1
        }
      })

      if (sel > -1) {
        tr.setSelection(TextSelection.near(tr.doc.resolve(sel)))
      }

      tr.scrollIntoView()
    }

    return true
  }

  const nextType = $to.pos === $from.end()
    ? grandParent.contentMatchAt(0).defaultType
    : null

  const newTypeAttributes = getSplittedAttributes(
    extensionAttributes,
    grandParent.type.name,
    grandParent.attrs,
  )
  const newNextTypeAttributes = getSplittedAttributes(
    extensionAttributes,
    $from.node().type.name,
    $from.node().attrs,
  )

  tr.delete($from.pos, $to.pos)

  const types = nextType
    ? [{ type, attrs: newTypeAttributes }, { type: nextType, attrs: newNextTypeAttributes }]
    : [{ type, attrs: newTypeAttributes }]

  if (!canSplit(tr.doc, $from.pos, 2)) {
    return false
  }

  if (dispatch) {
    tr.split($from.pos, 2, types).scrollIntoView()
  }

  return true
}
