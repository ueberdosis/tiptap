import './styles.scss'

import Image from '@tiptap/extension-image'
import { TableKit } from '@tiptap/extension-table'
import { Markdown } from '@tiptap/markdown'
import { useEditor, Tiptap } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useState } from 'react'

export default () => {
  const [serializedContent, setSerializedContent] = useState('')
  const editor = useEditor({
    extensions: [Markdown, StarterKit, Image, TableKit],
    content: `
      <p>In this demo, you can serialize Tiptap content into Markdown on the client-side via <code>@tiptap/markdown</code>.</p>
      <p>Feel free to edit this document to see the live-changes.</p>
    `,
    onUpdate: ({ editor: currentEditor }) => {
      setSerializedContent(currentEditor.getMarkdown())
    },
    onCreate: ({ editor: currentEditor }) => {
      setSerializedContent(currentEditor.getMarkdown())
    },
  })

  return (
    <>
      <div className="grid">
        <Tiptap instance={editor}>
          <Tiptap.Content className="editor-wrapper" />
        </Tiptap>
        <div className="preview">
          <pre>{serializedContent}</pre>
        </div>
      </div>
    </>
  )
}
