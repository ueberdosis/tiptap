import type { EditorOptions } from '@tiptap/core'

import { Editor } from '../Editor.js'

export const useEditor = (options: Partial<EditorOptions> = {}) => {
  const editor = new Editor(options)

  $effect(() => {
    return () => {
      const nodes = editor.view.dom?.parentNode
      const newEl = nodes?.cloneNode(true) as HTMLElement
      nodes?.parentNode?.replaceChild(newEl, nodes)
      editor.destroy()
    }
  })

  return editor
}
