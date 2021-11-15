import React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import TextStyle from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'

export default () => {
  const editor = useEditor({
    extensions: [Document, Paragraph, Text, TextStyle, Color],
    content: `
        <p><span style="color: #958DF1">Oh, for some reason that’s purple.</span></p>
      `,
  })

  if (!editor) {
    return null
  }

  return (
    <div>
      <input
        type="color"
        onInput={event => editor.chain().focus().setColor(event.target.value).run()}
        value={editor.getAttributes('textStyle').color}
      />
      <button
        onClick={() => editor.chain().focus().setColor('#958DF1').run()}
        className={editor.isActive('textStyle', { color: '#958DF1' }) ? 'is-active' : ''}
      >
        purple
      </button>
      <button
        onClick={() => editor.chain().focus().setColor('#F98181').run()}
        className={editor.isActive('textStyle', { color: '#F98181' }) ? 'is-active' : ''}
      >
        red
      </button>
      <button
        onClick={() => editor.chain().focus().setColor('#FBBC88').run()}
        className={editor.isActive('textStyle', { color: '#FBBC88' }) ? 'is-active' : ''}
      >
        orange
      </button>
      <button
        onClick={() => editor.chain().focus().setColor('#FAF594').run()}
        className={editor.isActive('textStyle', { color: '#FAF594' }) ? 'is-active' : ''}
      >
        yellow
      </button>
      <button
        onClick={() => editor.chain().focus().setColor('#70CFF8').run()}
        className={editor.isActive('textStyle', { color: '#70CFF8' }) ? 'is-active' : ''}
      >
        blue
      </button>
      <button
        onClick={() => editor.chain().focus().setColor('#94FADB').run()}
        className={editor.isActive('textStyle', { color: '#94FADB' }) ? 'is-active' : ''}
      >
        teal
      </button>
      <button
        onClick={() => editor.chain().focus().setColor('#B9F18D').run()}
        className={editor.isActive('textStyle', { color: '#B9F18D' }) ? 'is-active' : ''}
      >
        green
      </button>
      <button onClick={() => editor.chain().focus().unsetColor().run()}>unsetColor</button>

      <EditorContent editor={editor} />
    </div>
  )
}
