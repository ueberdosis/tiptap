import type { EditorOptions } from '@tiptap/core'
import { onBeforeUnmount, onMounted, shallowRef } from 'vue'

import { Editor } from './Editor.js'

export const useEditor = (options: Partial<EditorOptions> = {}) => {
  const editor = shallowRef<Editor>()

  onMounted(() => {
    // Nuxt can call `onMounted` twice on the same component instance during hydration,
    // the editor created the first time has to be destroyed instead of being left behind
    editor.value?.destroy()
    editor.value = new Editor(options)
  })

  onBeforeUnmount(() => {
    editor.value?.destroy()
  })

  return editor
}
