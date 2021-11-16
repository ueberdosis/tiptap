import React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Highlight from '@tiptap/extension-highlight'
import './styles.scss'

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
      <button
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        className={editor.isActive('highlight') ? 'is-active' : ''}
      >
        toggleHighlight
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHighlight({ color: '#ffc078' }).run()}
        className={editor.isActive('highlight', { color: '#ffc078' }) ? 'is-active' : ''}
      >
        orange
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHighlight({ color: '#8ce99a' }).run()}
        className={editor.isActive('highlight', { color: '#8ce99a' }) ? 'is-active' : ''}
      >
        green
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHighlight({ color: '#74c0fc' }).run()}
        className={editor.isActive('highlight', { color: '#74c0fc' }) ? 'is-active' : ''}
      >
        blue
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHighlight({ color: '#b197fc' }).run()}
        className={editor.isActive('highlight', { color: '#b197fc' }) ? 'is-active' : ''}
      >
        purple
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHighlight({ color: 'red' }).run()}
        className={editor.isActive('highlight', { color: 'red' }) ? 'is-active' : ''}
      >
        red ('red')
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHighlight({ color: '#ffa8a8' }).run()}
        className={editor.isActive('highlight', { color: '#ffa8a8' }) ? 'is-active' : ''}
      >
        red (#ffa8a8)
      </button>
      <button
        onClick={() => editor.chain().focus().unsetHighlight().run()}
        disabled={!editor.isActive('highlight')}
      >
        unsetHighlight
      </button>

      <EditorContent editor={editor} />
    </>
  )
}
