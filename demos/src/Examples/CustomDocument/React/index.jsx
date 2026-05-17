import './styles.scss'

import Document from '@tiptap/editor/nodes/document'
import { Placeholder } from '@tiptap/editor/extensions/placeholder'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/editor/kits/starter'
import React from 'react'

const CustomDocument = Document.extend({
  content: 'heading block*',
})

export default () => {
  const editor = useEditor({
    extensions: [
      CustomDocument,
      StarterKit.configure({
        document: false,
        trailingNode: {
          node: 'paragraph',
        },
      }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === 'heading') {
            return 'What’s the title?'
          }

          return 'Can you add some further context?'
        },
      }),
    ],
    content: `
      <h1>
        It’ll always have a heading …
      </h1>
      <p>
        … if you pass a custom document. That’s the beauty of having full control over the schema.
      </p>
    `,
  })

  return <EditorContent editor={editor} />
}
