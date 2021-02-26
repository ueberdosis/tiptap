import React, { useState } from 'react'
import { defaultExtensions } from '@tiptap/starter-kit'
import { useEditor, Editor } from '@tiptap/react'

// Menu bar example component
// useEditor only works for child components of <Editor />
const MenuBar = () => {
  const editor = useEditor()

  return (
    <>
      <button onClick={() => editor.chain().focus().unsetAllMarks().run()}>
        Clear formatting
      </button>
      <button
        className={`${editor.isActive('bold') ? 'is-active' : ''}`}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        Bold
      </button>
    </>
  )
}

export default () => {
  const [value, setValue] = useState({
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'rendered in ',
          },
          {
            type: 'text',
            marks: [
              {
                type: 'bold',
              },
            ],
            text: 'react',
          },
          {
            type: 'text',
            text: '!',
          },
        ],
      },
    ],
  })

  return (
    <>
      <p>
        <button onClick={() => alert(JSON.stringify(value))}>Alert state</button>
      </p>
      <hr style={{ margin: '0.85rem 0' }} />
      <Editor
        value={value}
        onChange={setValue}
        extensions={defaultExtensions()}
      >
        <MenuBar />
      </Editor>
    </>
  )
}
