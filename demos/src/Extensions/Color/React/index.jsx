import './styles.scss'

import { Color } from '@tiptap/extension-color'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import TextStyle from '@tiptap/extension-text-style'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import React from 'react'

export default () => {
  const editor = useEditor({
    extensions: [Document, Paragraph, Text, TextStyle, Color],
    content: `
        <p><span style="color: #958DF1">Oh, for some reason that’s purple.</span></p>
      `,
  })

  const editorState = useEditorState({
    editor,
    selector: ctx => {
      return {
        color: ctx.editor.getAttributes('textStyle').color,
        isPurple: ctx.editor.isActive('textStyle', { color: '#958DF1' }),
        isRed: ctx.editor.isActive('textStyle', { color: '#F98181' }),
        isOrange: ctx.editor.isActive('textStyle', { color: '#FBBC88' }),
        isYellow: ctx.editor.isActive('textStyle', { color: '#FAF594' }),
        isBlue: ctx.editor.isActive('textStyle', { color: '#70CFF8' }),
        isTeal: ctx.editor.isActive('textStyle', { color: '#94FADB' }),
        isGreen: ctx.editor.isActive('textStyle', { color: '#B9F18D' }),
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
            onInput={event => editor.chain().focus().setColor(event.target.value).run()}
            value={editorState.color}
            data-testid="setColor"
          />
          <button
            onClick={() => editor.chain().focus().setColor('#958DF1').run()}
            className={editorState.isPurple ? 'is-active' : ''}
            data-testid="setPurple"
          >
            Purple
          </button>
          <button
            onClick={() => editor.chain().focus().setColor('#F98181').run()}
            className={editorState.isRed ? 'is-active' : ''}
            data-testid="setRed"
          >
            Red
          </button>
          <button
            onClick={() => editor.chain().focus().setColor('#FBBC88').run()}
            className={editorState.isOrange ? 'is-active' : ''}
            data-testid="setOrange"
          >
            Orange
          </button>
          <button
            onClick={() => editor.chain().focus().setColor('#FAF594').run()}
            className={editorState.isYellow ? 'is-active' : ''}
            data-testid="setYellow"
          >
            Yellow
          </button>
          <button
            onClick={() => editor.chain().focus().setColor('#70CFF8').run()}
            className={editorState.isBlue ? 'is-active' : ''}
            data-testid="setBlue"
          >
            Blue
          </button>
          <button
            onClick={() => editor.chain().focus().setColor('#94FADB').run()}
            className={editorState.isTeal ? 'is-active' : ''}
            data-testid="setTeal"
          >
            Teal
          </button>
          <button
            onClick={() => editor.chain().focus().setColor('#B9F18D').run()}
            className={editorState.isGreen ? 'is-active' : ''}
            data-testid="setGreen"
          >
            Green
          </button>
          <button onClick={() => editor.chain().focus().unsetColor().run()} data-testid="unsetColor">
            Unset color
          </button>
        </div>
      </div>

      <EditorContent editor={editor} />
    </>
  )
}
