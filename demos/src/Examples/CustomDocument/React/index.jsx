import './styles.scss'

import Document from '@dibdab/extension-document'
import { Placeholder } from '@dibdab/extensions'
import { EditorContent, useEditor } from '@dibdab/react'
import StarterKit from '@dibdab/starter-kit'
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
