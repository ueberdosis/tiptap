import { Editor, findParentNode } from '@tiptap/core'

import type { DetailsListOptions } from './type'

export const insertNewDetailsList = (editor: Editor, options: DetailsListOptions) => {
  const { state } = editor
  const { $anchor } = state.selection
  const node = $anchor.node()

  const detailsData = findParentNode(currentNode => currentNode.type.name === options.wrapperNodeType)(state.selection)

  if (!detailsData) {
    return false
  }

  const $contentNodePos = state.doc.resolve($anchor.pos + (node.content.size - $anchor.parentOffset) + 2)
  const contentNode = $contentNodePos.node()
  const $detailsNodePos = state.doc.resolve(detailsData.start)

  if (!contentNode || contentNode.type.name !== options.contentNodeType) {
    return false
  }

  const targetPos = $contentNodePos.end() + 1
  const contentDomElement = editor.view.domAtPos($contentNodePos.pos).node as HTMLElement

  // check if the content node of the current summary is hidden
  // if not, run the default enter behavior
  if (contentDomElement && !contentDomElement.hidden) {
    return false
  }

  // if there is no content inside the summary
  // and the contentNode does not have content
  // we will remove the node
  // and insert an empty paragraph
  if (node.textContent.length === 0 && contentNode.content.size === 2) {
    return editor.chain().insertContentAt($detailsNodePos.end() + 1, {
      type: 'paragraph',
    }).deleteNode(options.wrapperNodeType).focus()
      .run()
  }

  const contentSliceStart = $anchor.pos
  const contentSliceEnd = $anchor.start() + node.content.size
  const sliceDiff = contentSliceEnd - contentSliceStart

  const contentSlice = state.doc.slice(contentSliceStart, contentSliceEnd)

  return editor.chain()
    .command(({ tr }) => {
      tr.deleteRange(contentSliceStart, contentSliceEnd)
      return true
    })
    .insertContentAt(targetPos - sliceDiff, {
      type: options.wrapperNodeType,
      content: [
        {
          type: options.summaryNodeType,
        },
        {
          type: options.contentNodeType,
          content: [
            {
              type: 'paragraph',
            },
          ],
        },
      ],
    })
    .insertContentAt(targetPos + 3 - sliceDiff, JSON.parse(JSON.stringify(contentSlice.content)))
    .focus(targetPos + 3 - sliceDiff)
    .run()
}
