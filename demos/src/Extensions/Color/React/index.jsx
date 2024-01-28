import { Color } from '@tiptap/extension-color'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import TextStyle from '@tiptap/extension-text-style'
import { EditorContent, useEditor } from '@tiptap/react'
import React from 'react'

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
        data-testid="setColor"
      />
      <button
        onClick={() => editor.chain().focus().setColor('#958DF1').run()}
        className={editor.isActive('textStyle', { color: '#958DF1' }) ? 'is-active' : ''}
        data-testid="setPurple"
      >
        purple
      </button>
      <button
        onClick={() => editor.chain().focus().setColor('#F98181').run()}
        className={editor.isActive('textStyle', { color: '#F98181' }) ? 'is-active' : ''}
        data-testid="setRed"
      >
        red
      </button>
      <button
        onClick={() => editor.chain().focus().setColor('#FBBC88').run()}
        className={editor.isActive('textStyle', { color: '#FBBC88' }) ? 'is-active' : ''}
        data-testid="setOrange"
      >
        orange
      </button>
      <button
        onClick={() => editor.chain().focus().setColor('#FAF594').run()}
        className={editor.isActive('textStyle', { color: '#FAF594' }) ? 'is-active' : ''}
        data-testid="setYellow"
      >
        yellow
      </button>
      <button
        onClick={() => editor.chain().focus().setColor('#70CFF8').run()}
        className={editor.isActive('textStyle', { color: '#70CFF8' }) ? 'is-active' : ''}
        data-testid="setBlue"
      >
        blue
      </button>
      <button
        onClick={() => editor.chain().focus().setColor('#94FADB').run()}
        className={editor.isActive('textStyle', { color: '#94FADB' }) ? 'is-active' : ''}
        data-testid="setTeal"
      >
        teal
      </button>
      <button
        onClick={() => editor.chain().focus().setColor('#B9F18D').run()}
        className={editor.isActive('textStyle', { color: '#B9F18D' }) ? 'is-active' : ''}
        data-testid="setGreen"
      >
        green
      </button>
      <button
        onClick={() => editor.chain().focus().unsetColor().run()}
        data-testid="unsetColor"
      >
        unsetColor
      </button>

      <EditorContent editor={editor} />
    </div>
  )
}
