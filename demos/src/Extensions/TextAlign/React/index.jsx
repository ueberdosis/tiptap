import './styles.scss'

import Document from '@tiptap/extension-document'
import Heading from '@tiptap/extension-heading'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import TextAlign from '@tiptap/extension-text-align'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import React from 'react'

export default () => {
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Heading,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: `
        <h2>Heading</h2>
        <p style="text-align: center">first paragraph</p>
        <p style="text-align: right">second paragraph</p>
      `,
  })

  const { isLeft, isCenter, isRight, isJustify, isHeading1, isHeading2 } = useEditorState({
    editor,
    selector: ctx => {
      if (!ctx.editor) {
        return {
          isLeft: false,
          isCenter: false,
          isRight: false,
          isJustify: false,
          isHeading1: false,
          isHeading2: false,
        }
      }

      return {
        isLeft: ctx.editor.isActive({ textAlign: 'left' }) ?? false,
        isCenter: ctx.editor.isActive({ textAlign: 'center' }) ?? false,
        isRight: ctx.editor.isActive({ textAlign: 'right' }) ?? false,
        isJustify: ctx.editor.isActive({ textAlign: 'justify' }) ?? false,
        isHeading1: ctx.editor.isActive({ level: 1 }) ?? false,
        isHeading2: ctx.editor.isActive({ level: 2 }) ?? false,
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
          <button
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={isLeft ? 'is-active' : ''}
          >
            Left
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={isCenter ? 'is-active' : ''}
          >
            Center
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={isRight ? 'is-active' : ''}
          >
            Right
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            className={isJustify ? 'is-active' : ''}
          >
            Justify
          </button>
          <button onClick={() => editor.chain().focus().unsetTextAlign().run()}>
            Unset text align
          </button>
          <button
            onClick={() => editor.chain().focus().toggleTextAlign('right').run()}
            className={isRight ? 'is-active' : ''}
          >
            Toggle Right
          </button>
          <button
            onClick={() => editor.chain().focus().toggleTextAlign('right').run()}
            className={isRight ? 'is-active' : ''}
          >
            Toggle Right
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={isHeading1 ? 'is-active' : ''}
          >
            Toggle H1
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={isHeading2 ? 'is-active' : ''}
          >
            Toggle H2
          </button>
        </div>
      </div>
      <EditorContent editor={editor} />
    </>
  )
}
