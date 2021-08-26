import { onMounted, onBeforeUnmount, shallowRef } from 'vue'
import { EditorOptions } from '@tiptap/core'
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
