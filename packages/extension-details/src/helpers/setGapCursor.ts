import { Editor, findChildren, findParentNode } from '@tiptap/core'
import { GapCursor } from '@tiptap/pm/gapcursor'
import { ResolvedPos } from '@tiptap/pm/model'
import { Selection } from '@tiptap/pm/state'

import { isNodeVisible } from './isNodeVisible.js'

export const setGapCursor = (editor: Editor, direction: 'down' | 'right') => {
  const { state, view, extensionManager } = editor
  const { schema, selection } = state
  const { empty, $anchor } = selection
  const hasGapCursorExtension = !!extensionManager.extensions.find(extension => extension.name === 'gapCursor')

  if (
    !empty
    || $anchor.parent.type !== schema.nodes.detailsSummary
    || !hasGapCursorExtension
  ) {
    return false
  }

  if (
    direction === 'right'
    && $anchor.parentOffset !== ($anchor.parent.nodeSize - 2)
  ) {
    return false
  }

  const details = findParentNode(node => node.type === schema.nodes.details)(selection)

  if (!details) {
    return false
  }

  const detailsContent = findChildren(details.node, node => node.type === schema.nodes.detailsContent)

  if (!detailsContent.length) {
    return false
  }

  const isOpen = isNodeVisible(details.start + detailsContent[0].pos + 1, editor)

  if (isOpen) {
    return false
  }

  const $position = state.doc.resolve(details.pos + details.node.nodeSize)
  const $validPosition = GapCursor.findFrom($position, 1, false) as unknown as (null | ResolvedPos)

  if (!$validPosition) {
    return false
  }

  const { tr } = state
  const gapCursorSelection = new GapCursor($validPosition) as Selection

  tr.setSelection(gapCursorSelection)
  tr.scrollIntoView()
  view.dispatch(tr)

  return true
}
