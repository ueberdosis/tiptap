import { useEditor, Tiptap } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import React, { useState } from 'react'

import type { TNote } from './types.js'

export default ({ note }: { note: TNote }) => {
  const [modelValue, setModelValue] = useState(note.content)

  const editor = useEditor({
    content: modelValue,
    editorProps: {
      attributes: {
        class: 'textarea',
      },
    },
    onUpdate() {
      setModelValue(editor?.getText() ?? '')
    },
    extensions: [StarterKit],
  })

  return (
    // @ts-ignore
    <Tiptap instance={editor}>
      <Tiptap.Content />
    </Tiptap>
  )
}
