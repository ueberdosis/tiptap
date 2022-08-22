import { Document } from '@tiptap/extension-document'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Text } from '@tiptap/extension-text'
import { EditorContent, useEditor } from '@tiptap/react'
import React from 'react'

const ParagraphDocument = Document.extend({
  content: 'paragraph',
})

export default ({ title, content }) => {
  const editor = useEditor({
    content,
    extensions: [
      ParagraphDocument,
      Paragraph,
      Text,
    ],
  })

  return (
    <div className="grid" v-if="editor">
      <div className="label">Editor { title }:</div>
      <div className="wrapper">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
