import './styles.scss'

import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import { BubbleMenu, FloatingMenu } from '@tiptap/react/menus'
import StarterKit from '@tiptap/starter-kit'
import React from 'react'

export default () => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: `
      <p>
        Try to select <em>this text</em> to see what we call the bubble menu.
      </p>
      <p>
        Neat, isn’t it? Add an empty paragraph to see the floating menu.
      </p>
    `,
  })

  const { isBold, isItalic, isStrike, isHeading1, isHeading2, isBulletList } = useEditorState({
    editor,
    selector: ctx => {
      if (!ctx.editor) {
        return {
          isBold: false,
          isItalic: false,
          isStrike: false,
          isHeading1: false,
          isHeading2: false,
          isBulletList: false,
        }
      }

      return {
        isBold: ctx.editor.isActive('bold') ?? false,
        isItalic: ctx.editor.isActive('italic') ?? false,
        isStrike: ctx.editor.isActive('strike') ?? false,
        isHeading1: ctx.editor.isActive('heading', { level: 1 }) ?? false,
        isHeading2: ctx.editor.isActive('heading', { level: 2 }) ?? false,
        isBulletList: ctx.editor.isActive('bulletList') ?? false,
      }
    },
  })

  return (
    <>
      {editor && (
        <BubbleMenu className="bubble-menu" editor={editor}>
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={isBold ? 'is-active' : ''}
          >
            Bold
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={isItalic ? 'is-active' : ''}
          >
            Italic
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={isStrike ? 'is-active' : ''}
          >
            Strike
          </button>
        </BubbleMenu>
      )}

      {editor && (
        <FloatingMenu className="floating-menu" editor={editor}>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={isHeading1 ? 'is-active' : ''}
          >
            H1
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={isHeading2 ? 'is-active' : ''}
          >
            H2
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={isBulletList ? 'is-active' : ''}
          >
            Bullet list
          </button>
        </FloatingMenu>
      )}

      <EditorContent editor={editor} />
    </>
  )
}
