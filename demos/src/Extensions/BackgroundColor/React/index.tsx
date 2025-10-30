import './styles.scss'

import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { BackgroundColor, TextStyle } from '@tiptap/extension-text-style'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import React from 'react'

export default () => {
  const editor = useEditor({
    extensions: [Document, Paragraph, Text, TextStyle, BackgroundColor],
    content: `
        <p><span style="background-color: #958DF1">Oh, for some reason that’s purple.</span></p>
        <p><span style="background-color: rgba(149, 141, 241, 0.5)">Oh, for some reason that’s purple but with rgba.</span></p>
      `,
  })

  const editorState = useEditorState({
    editor,
    selector: ctx => {
      return {
        color: ctx.editor.getAttributes('textStyle').backgroundColor,
        isPurple: ctx.editor.isActive('textStyle', { backgroundColor: '#958DF1' }),
        isRed: ctx.editor.isActive('textStyle', { backgroundColor: '#F98181' }),
        isOrange: ctx.editor.isActive('textStyle', { backgroundColor: '#FBBC88' }),
        isYellow: ctx.editor.isActive('textStyle', { backgroundColor: '#FAF594' }),
        isBlue: ctx.editor.isActive('textStyle', { backgroundColor: '#70CFF8' }),
        isTeal: ctx.editor.isActive('textStyle', { backgroundColor: '#94FADB' }),
        isGreen: ctx.editor.isActive('textStyle', { backgroundColor: '#B9F18D' }),
      }
    },
  })

  if (!editor) {
    return null
  }

  return (
    <>
      <div className="control-group">
        <div className="button-group">
          <input
            type="color"
            onInput={event => editor.chain().focus().setBackgroundColor(event.currentTarget.value).run()}
            value={editorState.color}
            data-testid="setBackgroundColor"
          />
          <button
            onClick={() => editor.chain().focus().setBackgroundColor('#958DF1').run()}
            className={editorState.isPurple ? 'is-active' : ''}
            data-testid="setPurple"
          >
            Purple
          </button>
          <button
            onClick={() => editor.chain().focus().setBackgroundColor('#F98181').run()}
            className={editorState.isRed ? 'is-active' : ''}
            data-testid="setRed"
          >
            Red
          </button>
          <button
            onClick={() => editor.chain().focus().setBackgroundColor('#FBBC88').run()}
            className={editorState.isOrange ? 'is-active' : ''}
            data-testid="setOrange"
          >
            Orange
          </button>
          <button
            onClick={() => editor.chain().focus().setBackgroundColor('#FAF594').run()}
            className={editorState.isYellow ? 'is-active' : ''}
            data-testid="setYellow"
          >
            Yellow
          </button>
          <button
            onClick={() => editor.chain().focus().setBackgroundColor('#70CFF8').run()}
            className={editorState.isBlue ? 'is-active' : ''}
            data-testid="setBlue"
          >
            Blue
          </button>
          <button
            onClick={() => editor.chain().focus().setBackgroundColor('#94FADB').run()}
            className={editorState.isTeal ? 'is-active' : ''}
            data-testid="setTeal"
          >
            Teal
          </button>
          <button
            onClick={() => editor.chain().focus().setBackgroundColor('#B9F18D').run()}
            className={editorState.isGreen ? 'is-active' : ''}
            data-testid="setGreen"
          >
            Green
          </button>
          <button
            onClick={() => editor.chain().focus().unsetBackgroundColor().run()}
            data-testid="unsetBackgroundColor"
          >
            Unset color
          </button>
        </div>
      </div>

      <EditorContent editor={editor} />
    </>
  )
}
