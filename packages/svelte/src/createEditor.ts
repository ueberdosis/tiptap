import type { EditorOptions } from '@tiptap/core'
import { onMount } from 'svelte'

import { Editor } from './Editor.js'

export const createEditor = (options: Partial<EditorOptions> = {}) => {
  let editor: Editor

  onMount(() => {
    editor = new Editor(options)

    return () => {
      const nodes = editor.view.dom?.parentNode
      const newEl = nodes?.cloneNode(true) as HTMLElement

      nodes?.parentNode?.replaceChild(newEl, nodes)

      editor.destroy()
    }
  })

  return editor
}
