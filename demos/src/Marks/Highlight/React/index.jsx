import './styles.scss'

import Document from '@tiptap/extension-document'
import Highlight from '@tiptap/extension-highlight'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { EditorContent, useEditor } from '@tiptap/react'
import React from 'react'

export default () => {
  const editor = useEditor({
    extensions: [Document, Paragraph, Text, Highlight.configure({ multicolor: true })],
    content: `
        <p>This isn’t highlighted.</s></p>
        <p><mark>But that one is.</mark></p>
        <p><mark style="background-color: red;">And this is highlighted too, but in a different color.</mark></p>
        <p><mark data-color="#ffa8a8">And this one has a data attribute.</mark></p>
      `,
  })

  if (!editor) {
    return null
  }

  return (
    <>
      <div className="control-group">
        <div className="button-group">
          <button
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={editor.isActive('highlight') ? 'is-active' : ''}
          >
            Toggle highlight
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHighlight({ color: '#ffc078' }).run()}
            className={editor.isActive('highlight', { color: '#ffc078' }) ? 'is-active' : ''}
          >
            Orange
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHighlight({ color: '#8ce99a' }).run()}
            className={editor.isActive('highlight', { color: '#8ce99a' }) ? 'is-active' : ''}
          >
            Green
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHighlight({ color: '#74c0fc' }).run()}
            className={editor.isActive('highlight', { color: '#74c0fc' }) ? 'is-active' : ''}
          >
            Blue
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHighlight({ color: '#b197fc' }).run()}
            className={editor.isActive('highlight', { color: '#b197fc' }) ? 'is-active' : ''}
          >
            Purple
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHighlight({ color: 'red' }).run()}
            className={editor.isActive('highlight', { color: 'red' }) ? 'is-active' : ''}
          >
            Red ('red')
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHighlight({ color: '#ffa8a8' }).run()}
            className={editor.isActive('highlight', { color: '#ffa8a8' }) ? 'is-active' : ''}
          >
            Red (#ffa8a8)
          </button>
          <button
            onClick={() => editor.chain().focus().unsetHighlight().run()}
            disabled={!editor.isActive('highlight')}
          >
            Unset highlight
          </button>
        </div>
      </div>

      <EditorContent editor={editor} />
    </>
  )
}
