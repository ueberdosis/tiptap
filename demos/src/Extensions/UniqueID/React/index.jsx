import './styles.scss'

import UniqueID from '@dibdab/extension-unique-id'
import { EditorContent, useEditor } from '@dibdab/react'
import StarterKit from '@dibdab/starter-kit'
import React from 'react'

export default () => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      UniqueID.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: `
      <h1>
        This is a very unique heading.
      </h1>
      <p>
        This is a unique paragraph. It’s so unique, it even has an ID attached to it.
      </p>
      <p>
        And this one, too.
      </p>
    `,
  })

  return <EditorContent editor={editor} />
}
