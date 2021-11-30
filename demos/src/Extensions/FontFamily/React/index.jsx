import React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import TextStyle from '@tiptap/extension-text-style'
import FontFamily from '@tiptap/extension-font-family'

export default () => {
  const editor = useEditor({
    extensions: [Document, Paragraph, Text, TextStyle, FontFamily],
    content: `
        <p><span style="font-family: Inter">Did you know that Inter is a really nice font for interfaces?</span></p>
        <p><span style="font-family: Comic Sans MS, Comic Sans">It doesn’t look as professional as Comic Sans.</span></p>
        <p><span style="font-family: serif">Serious people use serif fonts anyway.</span></p>
        <p><span style="font-family: monospace">The cool kids can apply monospace fonts aswell.</span></p>
        <p><span style="font-family: cursive">But hopefully we all can agree, that cursive fonts are the best.</span></p>
      `,
  })

  if (!editor) {
    return null
  }

  return (
    <div>
      <button
        onClick={() => editor.chain().focus().setFontFamily('Inter').run()}
        className={editor.isActive('textStyle', { fontFamily: 'Inter' }) ? 'is-active' : ''}
      >
        Inter
      </button>
      <button
        onClick={() => editor.chain().focus().setFontFamily('Comic Sans MS, Comic Sans').run()}
        className={
          editor.isActive('textStyle', { fontFamily: 'Comic Sans MS, Comic Sans' })
            ? 'is-active'
            : ''
        }
      >
        Comic Sans
      </button>
      <button
        onClick={() => editor.chain().focus().setFontFamily('serif').run()}
        className={editor.isActive('textStyle', { fontFamily: 'serif' }) ? 'is-active' : ''}
      >
        serif
      </button>
      <button
        onClick={() => editor.chain().focus().setFontFamily('monospace').run()}
        className={editor.isActive('textStyle', { fontFamily: 'monospace' }) ? 'is-active' : ''}
      >
        monospace
      </button>
      <button
        onClick={() => editor.chain().focus().setFontFamily('cursive').run()}
        className={editor.isActive('textStyle', { fontFamily: 'cursive' }) ? 'is-active' : ''}
      >
        cursive
      </button>
      <button onClick={() => editor.chain().focus().unsetFontFamily().run()}>
        unsetFontFamily
      </button>

      <EditorContent editor={editor} />
    </div>
  )
}
