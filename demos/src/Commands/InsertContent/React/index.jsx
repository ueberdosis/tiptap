import './styles.scss'

import { Color } from '@tiptap/extension-color'
import { Image } from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import ListItem from '@tiptap/extension-list-item'
import TextStyle from '@tiptap/extension-text-style'
import { EditorProvider, useCurrentEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React, { useCallback } from 'react'

const htmlContent = `
  <h1><a href="https://tiptap.dev/">Tiptap</a></h1>
  <p><strong>Hello World</strong></p>
  <p>This is a paragraph<br />with a break.</p>
  <p>And this is some additional string content.</p>
`

const textContent = `Hello World
This is content with a new line. Is this working?

Lets see if multiple new lines are inserted correctly

And more lines`

const MenuBar = () => {
  const { editor } = useCurrentEditor()

  const insertImage = useCallback(() => {
    const url = prompt('Enter an image URL')

    editor.chain().insertContent(`<img src="${url}" alt="Example image" />`).focus().run()
  }, [editor])

  if (!editor) {
    return null
  }

  return (
    <div className="control-group">
      <div className="button-group">
        <button data-test-id="html-content" onClick={() => editor.chain().insertContent(htmlContent).focus().run()}>
          Insert HTML content
        </button>
        <button
          data-test-id="html-content-spans"
          onClick={() => editor.chain().insertContent('<p><b>Hello</b> <i>World</i></p>').focus().run()}
        >
          Insert HTML with span tags content
        </button>
        <button data-test-id="text-content" onClick={() => editor.chain().insertContent(textContent).focus().run()}>
          Insert text content
        </button>
        <button data-test-id="image-content" onClick={insertImage}>
          Insert image
        </button>
      </div>
    </div>
  )
}

const extensions = [
  Image,
  Color.configure({ types: [TextStyle.name, ListItem.name] }),
  TextStyle.configure({ types: [ListItem.name] }),
  Link,
  StarterKit.configure({
    bulletList: {
      keepMarks: true,
    },
    orderedList: {
      keepMarks: true,
    },
  }),
]

const content = ''

export default () => {
  return <EditorProvider slotBefore={<MenuBar />} extensions={extensions} content={content}></EditorProvider>
}
