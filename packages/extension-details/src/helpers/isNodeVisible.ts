import { Editor } from '@tiptap/core'

export const isNodeVisible = (position: number, editor: Editor): boolean => {
  const node = editor.view.domAtPos(position).node as HTMLElement
  const isOpen = node.offsetParent !== null

  return isOpen
}
