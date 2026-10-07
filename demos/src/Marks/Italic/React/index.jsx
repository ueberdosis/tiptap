import './styles.scss'

import Document from '@tiptap/extension-document'
import Italic from '@tiptap/extension-italic'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import React from 'react'

export default () => {
  const editor = useEditor({
    extensions: [Document, Paragraph, Text, Italic],
    content: `
        <p>This isn’t italic.</p>
        <p><em>This is italic.</em></p>
        <p><i>And this.</i></p>
        <p style="font-style: italic">This as well.</p>
      `,
  })
  const { isItalic } = useEditorState({
    editor,
    selector: ctx => ({
      isItalic: ctx.editor.isActive('italic') ?? false,
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
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={isItalic ? 'is-active' : ''}
          >
            Toggle italic
          </button>
          <button onClick={() => editor.chain().focus().setItalic().run()} disabled={isItalic}>
            Set italic
          </button>
          <button onClick={() => editor.chain().focus().unsetItalic().run()} disabled={!isItalic}>
            Unset italic
          </button>
        </div>
      </div>
      <EditorContent editor={editor} />
    </>
  )
}
