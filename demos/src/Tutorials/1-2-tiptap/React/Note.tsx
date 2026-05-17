import { EditorContent, useEditor } from '@tiptap/react'
import { StarterKit } from '@tiptap/editor/kits/starter'
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
    <EditorContent editor={editor} />
  )
}
