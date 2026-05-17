import './styles.scss'

import { Placeholder } from '@tiptap/editor/extensions/placeholder'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/editor/kits/starter'
import React from 'react'

export default () => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        // Use a placeholder:
        placeholder: 'Write something …',
        // Use different placeholders depending on the node type:
        // placeholder: ({ node }) => {
        //   if (node.type.name === 'heading') {
        //     return 'What’s the title?'
        //   }

        //   return 'Can you add some further context?'
        // },
      }),
    ],
  })

  return <EditorContent editor={editor} />
}
