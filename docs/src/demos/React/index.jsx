import { useState } from 'react'
import extensions from '@tiptap/starter-kit'
import { useEditor, Editor } from './components/Editor'

// Menu bar example component
// useEditor only works for child components of <Editor />
const MenuBar = () => {
  const editor = useEditor()

  return (
    <>
      <button onClick={() => editor.chain().focus().removeMarks().run()}>
        Clear formatting
      </button>
      <button
        className={`${editor.isActive('bold') ? 'is-active' : ''}`}
        onClick={() => editor.chain().focus().bold().run()}
      >
        Bold
      </button>
    </>
  )
}

export default () => {
  const [value, setValue] = useState({
    type: 'document',
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
        extensions={extensions()}
      >
        <MenuBar />
      </Editor>
    </>
  )
}
