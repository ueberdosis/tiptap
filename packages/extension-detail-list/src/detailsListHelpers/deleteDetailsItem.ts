import { Editor, findParentNode } from '@tiptap/core'

import type { DetailsListOptions } from './type'

export const deleteDetailsItem = (editor: Editor, options: DetailsListOptions, forward: boolean) => {
  const { state } = editor

  const detailsData = findParentNode(currentNode => currentNode.type.name === options.wrapperNodeType)(state.selection)

  if (!detailsData) {
    return false
  }

  const $detailsPos = state.doc.resolve(detailsData.start)
  const $previousDetailsPos = state.doc.resolve(Math.max($detailsPos.pos - 2, 0))

  const previousDetailsNode = $previousDetailsPos.node()
  const previousNodeIsDetails = previousDetailsNode.type.name === options.wrapperNodeType

  if ((!forward && !previousNodeIsDetails)) {
    return false
  }

  const { $anchor } = state.selection
  const node = $anchor.node()

  const contentSliceStart = $anchor.pos
  const contentSliceEnd = $anchor.start() + node.content.size

  const contentSlice = state.doc.slice(contentSliceStart, contentSliceEnd)

  const targetPos = forward ? undefined : $previousDetailsPos.start() + 1
  const $summaryPos = state.doc.resolve(targetPos || 0)

  return editor.chain()
    .deleteNode(options.wrapperNodeType)
    .insertContentAt($summaryPos.end(), JSON.parse(JSON.stringify(contentSlice.content)))
    .focus($summaryPos.end())
    .run()
}
