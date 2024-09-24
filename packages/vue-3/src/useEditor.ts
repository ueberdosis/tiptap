import { EditorOptions } from '@tiptap/core'
import {
  onMounted, onUnmounted, shallowRef,
} from 'vue'

import { Editor } from './Editor.js'

export const useEditor = (options: Partial<EditorOptions> = {}) => {
  const editor = shallowRef<Editor>()

  onMounted(() => {
    editor.value = new Editor(options)
  })

  // onUnmounted(() => {
  //   editor.value?.destroy()
  // })

  return editor
}
