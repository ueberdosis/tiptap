import type { EditorOptions } from '@tiptap/core'

import { Editor } from '../Editor.js'

export const useEditor = (options: Partial<EditorOptions> = {}) => {
  const editor = new Editor(options)

  $effect(() => {
    return () => {
      // Reading `editor.view` throws while the editor is unmounted, which would
      // skip the destroy below. `isDestroyed` covers that case.
      if (!editor.isDestroyed) {
        const nodes = editor.view.dom?.parentNode
        const newEl = nodes?.cloneNode(true) as HTMLElement
        nodes?.parentNode?.replaceChild(newEl, nodes)
      }

      editor.destroy()
    }
  })

  return editor
}
