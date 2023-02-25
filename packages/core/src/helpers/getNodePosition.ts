import { Node } from '@tiptap/pm/model'

import { Editor } from '../Editor'

/**
 * This function returns the absolute position of a ProseMirror node in a
 * ProseMirror document.
 * @param node The ProseMirror node to get the position of
 * @param editor The Tiptap editor instance
 * @returns The ResolvedPos or null
 */
export const getNodePosition = (node: Node, editor: Editor) => {
  const { state } = editor.view

  let currentNode: Node | null = null
  let currentPos = 0

  // TODO: @bdbch
  // we may find a better way to do this
  // but for now, we'll just loop through the document
  // maybe we can make this more efficient by checking
  // if currentNode is of type text, and if so, we can
  // just add the length of the text to the currentPos
  // resulting in not having to loop through each position
  while (currentNode !== node) {
    currentNode = state.doc.nodeAt(currentPos)
    currentPos += 1
  }

  return state.doc.resolve(Math.min(Math.max(0, currentPos - 1), editor.state.doc.nodeSize))
}
