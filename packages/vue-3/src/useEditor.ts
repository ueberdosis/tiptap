import { EditorOptions } from '@tiptap/core'
import { onBeforeUnmount, onMounted, shallowRef } from 'vue'

import { Editor } from './Editor'

export const useEditor = (options: Partial<EditorOptions> = {}) => {
  const editor = shallowRef<Editor>()

  onMounted(() => {
    editor.value = new Editor(options)
  })

  onBeforeUnmount(() => {
    editor.value?.destroy()
  })

  return editor
}
