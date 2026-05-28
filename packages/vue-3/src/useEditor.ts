import type { EditorOptions } from '@tiptap/core'
import { onBeforeUnmount, onMounted, shallowRef } from 'vue'

import { Editor } from './Editor.js'

export const useEditor = (options: Partial<EditorOptions> = {}) => {
  const editor = shallowRef<Editor>()

  onMounted(() => {
    let instance: Editor | undefined

    const optionsToApply: Partial<EditorOptions> = {
      ...options,
      onBeforeCreate: (...args) => options.onBeforeCreate?.(...args),
      onBlur: (...args) => options.onBlur?.(...args),
      onCreate: (...args) => options.onCreate?.(...args),
      onDestroy: (...args) => {
        options.onDestroy?.(...args)

        if (editor.value === instance) {
          editor.value = undefined
        }
      },
      onFocus: (...args) => options.onFocus?.(...args),
      onSelectionUpdate: (...args) => options.onSelectionUpdate?.(...args),
      onTransaction: (...args) => options.onTransaction?.(...args),
      onUpdate: (...args) => options.onUpdate?.(...args),
      onContentError: (...args) => options.onContentError?.(...args),
      onBeforeMigrate: (...args) => options.onBeforeMigrate?.(...args),
      onMigrate: (...args) => options.onMigrate?.(...args),
      onMigrateStep: (...args) => options.onMigrateStep?.(...args),
      onMigrateError: (...args) => options.onMigrateError?.(...args),
      onDrop: (...args) => options.onDrop?.(...args),
      onPaste: (...args) => options.onPaste?.(...args),
      onDelete: (...args) => options.onDelete?.(...args),
    }

    try {
      instance = new Editor(optionsToApply)
      editor.value = instance
    } catch {
      editor.value = undefined
    }
  })

  onBeforeUnmount(() => {
    editor.value?.destroy()
  })

  return editor
}
