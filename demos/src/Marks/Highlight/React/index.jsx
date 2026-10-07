import './styles.scss'

import Document from '@tiptap/extension-document'
import Highlight from '@tiptap/extension-highlight'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
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
  const editorState = useEditorState({
    editor,
    selector: ctx => ({
      isHighlight: ctx.editor.isActive('highlight') ?? false,
      isOrange: ctx.editor.isActive('highlight', { color: '#ffc078' }) ?? false,
      isGreen: ctx.editor.isActive('highlight', { color: '#8ce99a' }) ?? false,
      isBlue: ctx.editor.isActive('highlight', { color: '#74c0fc' }) ?? false,
      isPurple: ctx.editor.isActive('highlight', { color: '#b197fc' }) ?? false,
      isRed: ctx.editor.isActive('highlight', { color: 'red' }) ?? false,
      isLightRed: ctx.editor.isActive('highlight', { color: '#ffa8a8' }) ?? false,
    }),
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
            className={editorState.isHighlight ? 'is-active' : ''}
          >
            Toggle highlight
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHighlight({ color: '#ffc078' }).run()}
            className={editorState.isOrange ? 'is-active' : ''}
          >
            Orange
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHighlight({ color: '#8ce99a' }).run()}
            className={editorState.isGreen ? 'is-active' : ''}
          >
            Green
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHighlight({ color: '#74c0fc' }).run()}
            className={editorState.isBlue ? 'is-active' : ''}
          >
            Blue
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHighlight({ color: '#b197fc' }).run()}
            className={editorState.isPurple ? 'is-active' : ''}
          >
            Purple
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHighlight({ color: 'red' }).run()}
            className={editorState.isRed ? 'is-active' : ''}
          >
            Red ('red')
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHighlight({ color: '#ffa8a8' }).run()}
            className={editorState.isLightRed ? 'is-active' : ''}
          >
            Red (#ffa8a8)
          </button>
          <button
            onClick={() => editor.chain().focus().unsetHighlight().run()}
            disabled={!editorState.isHighlight}
          >
            Unset highlight
          </button>
        </div>
      </div>

      <EditorContent editor={editor} />
    </>
  )
}
