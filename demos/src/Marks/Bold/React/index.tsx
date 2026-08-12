import './styles.scss'

import Bold from '@tiptap/extension-bold'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import React from 'react'

export default () => {
  const editor = useEditor({
    extensions: [Document, Paragraph, Text, Bold],
    content: `
        <p>This isn’t bold.</p>
        <p><strong>This is bold.</strong></p>
        <p><b>And this.</b></p>
        <p style="font-weight: bold">This as well.</p>
        <p style="font-weight: bolder">Oh, and this!</p>
        <p style="font-weight: 500">Cool, isn’t it!?</p>
        <p style="font-weight: 999">Up to font weight 999!!!</p>
      `,
    immediatelyRender: true,
  })

  const { isBold } = useEditorState({
    editor,
    selector: ctx => ({
      isBold: ctx.editor.isActive('bold') ?? false,
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
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={isBold ? 'is-active' : ''}
          >
            Toggle bold
          </button>
          <button onClick={() => editor.chain().focus().setBold().run()} disabled={isBold}>
            Set bold
          </button>
          <button onClick={() => editor.chain().focus().unsetBold().run()} disabled={!isBold}>
            Unset bold
          </button>
        </div>
      </div>
      <EditorContent editor={editor} />
    </>
  )
}
