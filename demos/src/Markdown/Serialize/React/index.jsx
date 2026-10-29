import './styles.scss'

import Image from '@tiptap/extension-image'
import { TableKit } from '@tiptap/extension-table'
import { Markdown } from '@tiptap/markdown'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useState } from 'react'

export default () => {
  const [serializedContent, setSerializedContent] = useState('')
  const updateMarkdown = ({ editor: currentEditor }) => {
    setSerializedContent(currentEditor.getMarkdown())
  }
  const editor = useEditor({
    extensions: [Markdown, StarterKit, Image, TableKit],
    content: `
      <p>In this demo, you can serialize Tiptap content into Markdown on the client-side via <code>@tiptap/markdown</code>.</p>
      <p>Feel free to edit this document to see the live-changes.</p>
      <p><u>Underlined text</u> exports as inline HTML. c++ is a good language, and c++ is nice.</p>
    `,
    onUpdate: updateMarkdown,
    onCreate: updateMarkdown,
  })

  return (
    <>
      <div className="grid">
        <EditorContent className="editor-wrapper" editor={editor} />
        <div className="preview">
          <pre>{serializedContent}</pre>
        </div>
      </div>
    </>
  )
}
