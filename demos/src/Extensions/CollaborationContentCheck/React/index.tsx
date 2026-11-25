import Collaboration from '@tiptap/extension-collaboration'
import Document from '@tiptap/extension-document'
import Heading from '@tiptap/extension-heading'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import type { Editor } from '@tiptap/react'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import { useState } from 'react'
import * as Y from 'yjs'

const ydoc = new Y.Doc()

const ReaderStatus = ({ reader, contentError }: { reader: Editor; contentError: string }) => {
  const isEditable = useEditorState({ editor: reader, selector: ctx => ctx.editor.isEditable })

  return (
    <div className="output-group">
      <p>Reader is editable: {isEditable ? 'yes' : 'no'}</p>
      <p>Last content error: {contentError}</p>
    </div>
  )
}

export default () => {
  const [contentError, setContentError] = useState('none')

  const writer = useEditor({
    extensions: [Document, Paragraph, Text, Heading, Collaboration.configure({ document: ydoc })],
  })

  // The reader's schema has no headings
  const reader = useEditor({
    extensions: [Document, Paragraph, Text, Collaboration.configure({ document: ydoc })],
    enableContentCheck: true,
    onContentError: ({ error }) => setContentError(error.message),
  })

  if (!writer || !reader) {
    return null
  }

  return (
    <>
      <div className="control-group">
        <div className="button-group">
          <button
            onClick={() =>
              writer
                .chain()
                .insertContentAt(writer.state.doc.content.size, '<h1>A heading</h1>')
                .run()
            }
          >
            Add a heading
          </button>
          <button onClick={() => writer.chain().selectAll().setParagraph().run()}>
            Turn headings into paragraphs
          </button>
        </div>
      </div>

      <h2>Writer</h2>
      <EditorContent editor={writer} />

      <h2>Reader with enableContentCheck</h2>
      <EditorContent editor={reader} />

      <ReaderStatus reader={reader} contentError={contentError} />
    </>
  )
}
