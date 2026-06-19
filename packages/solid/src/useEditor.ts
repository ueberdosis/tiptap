import type { EditorOptions } from '@tiptap/core'
import type { Accessor } from 'solid-js'
import { createSignal, getOwner, onCleanup } from 'solid-js'

import { Editor } from './Editor.js'
import { setReactiveOwner } from './ReactiveOwner.js'

export const useEditor = (options: Partial<EditorOptions> = {}): Accessor<Editor> => {
  const owner = getOwner()

  const [editor] = createSignal(
    new Editor({
      ...options,
      onBeforeCreate: props => {
        if (owner) {
          setReactiveOwner(props.editor, owner)
        }

        options.onBeforeCreate?.(props)
      },
    }),
  )

  onCleanup(() => {
    editor().destroy()
  })

  return editor
}
