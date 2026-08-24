import './styles.scss'

import { Document } from '@tiptap/editor/extensions/document'
import { Paragraph } from '@tiptap/editor/extensions/paragraph'
import { Strike } from '@tiptap/editor/extensions/strike'
import { Text } from '@tiptap/editor/extensions/text'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import React from 'react'

export default () => {
  const editor = useEditor({
    extensions: [Document, Paragraph, Text, Strike],
    content: `
          <p>This isn’t striked through.</s></p>
          <p><s>But that’s striked through.</s></p>
          <p><del>And this.</del></p>
          <p><strike>This too.</strike></p>
          <p style="text-decoration: line-through">This as well.</p>
        `,
  })
  const { isStrike } = useEditorState({
    editor,
    selector: ctx => ({
      isStrike: ctx.editor.isActive('strike') ?? false,
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
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={isStrike ? 'is-active' : ''}
          >
            Toggle strike
          </button>
          <button onClick={() => editor.chain().focus().setStrike().run()} disabled={isStrike}>
            Set strike
          </button>
          <button onClick={() => editor.chain().focus().unsetStrike().run()} disabled={!isStrike}>
            Unset strike
          </button>
        </div>
      </div>
      <EditorContent editor={editor} />
    </>
  )
}
