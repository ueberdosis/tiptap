import { EditorOptions } from '@tiptap/core'
import { onBeforeUnmount, onMounted, shallowRef } from 'vue'

import { Editor } from './Editor.js'

export const useEditor = (options: Partial<EditorOptions> = {}) => {
  const editor = shallowRef<Editor>()

  onMounted(() => {
    editor.value = new Editor(options)
  })

  onBeforeUnmount(() => {
    // Cloning root node (and its children) to avoid content being lost by destroy
    const nodes = editor.value?.options.element
    const newEl = nodes?.cloneNode(true) as HTMLElement

    nodes?.parentNode?.replaceChild(newEl, nodes)

    editor.value?.destroy()
  })

  return editor
}
