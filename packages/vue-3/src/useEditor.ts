import type { AnyExtension, EditorOptions } from '@tiptap/core'
import { onBeforeUnmount, onMounted, shallowRef } from 'vue'

import { Editor } from './Editor.js'

export const useEditor = <const TExtensions extends readonly AnyExtension[] = AnyExtension[]>(
  options: Partial<EditorOptions<TExtensions>> = {},
) => {
  const editor = shallowRef<Editor<TExtensions>>()

  onMounted(() => {
    editor.value = new Editor(options)
  })

  onBeforeUnmount(() => {
    editor.value?.destroy()
  })

  return editor
}
