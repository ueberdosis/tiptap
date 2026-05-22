import { getContext, setContext } from 'svelte'

import type { Editor } from '../Editor.js'

const EDITOR_CTX = Symbol('editor')

export const getEditor = (): Editor => {
  const editor = getContext<Editor>(EDITOR_CTX)

  if (!editor) {
    throw new Error('No editor found in context. Did you wrap your component in <Tiptap>?')
  }

  return editor
}

export const setEditor = (editor: Editor): void => {
  setContext(EDITOR_CTX, editor)
}
