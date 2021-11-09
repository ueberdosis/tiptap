import {
  onMounted,
  onBeforeUnmount,
  shallowRef,
  Ref,
} from 'vue'
import { EditorOptions } from '@tiptap/core'
import { Editor } from './Editor'

// We set a custom return type. Otherwise TypeScript will throw TS4023. Not sure why.
export const useEditor = (options: Partial<EditorOptions> = {}): Ref<Editor> => {
  const editor = shallowRef<Editor>() as Ref<Editor>

  onMounted(() => {
    editor.value = new Editor(options)
  })

  onBeforeUnmount(() => {
    editor.value?.destroy()
  })

  return editor
}
