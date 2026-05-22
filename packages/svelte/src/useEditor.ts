import type { EditorOptions } from '@tiptap/core'
import { onMount } from 'svelte'

import { Editor } from './Editor.js'

export const useEditor = (options: Partial<EditorOptions> = {}) => {
  let editor: Editor | undefined

  onMount(() => {
    editor = new Editor(options)

    return () => {
      if (!editor) {
        return
      }

      const nodes = editor.view.dom?.parentNode
      const newEl = nodes?.cloneNode(true) as HTMLElement
      nodes?.parentNode?.replaceChild(newEl, nodes)
      editor.destroy()
    }
  })

  return editor as Editor
}
