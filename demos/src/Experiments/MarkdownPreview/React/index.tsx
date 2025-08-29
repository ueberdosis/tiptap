import './styles.scss'

import { Details, DetailsContent, DetailsSummary } from '@tiptap/extension-details'
import Emoji from '@tiptap/extension-emoji'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React, { useEffect, useState } from 'react'

export default () => {
  const editor = useEditor({
    extensions: [StarterKit, Emoji, Details, DetailsSummary, DetailsContent],
    content: `
      <h1>Hello World. This is a test with Markdown</h1>
      <p>We have to see how well this translates now.</p>
      <details>
        <summary>This is a details block</summary>
        <div data-type="details-content">
          <p>This is the content of the details.</p>
        </div>
      </details>
    `,
  })

  const [markdown, setMarkdown] = useState('')

  useEffect(() => {
    if (!editor) {
      return
    }

    const update = () => {
      // Use getMarkdown() if available, otherwise fallback to getText
      const md = (editor as any).getMarkdown ? (editor as any).getMarkdown() : editor.getText()
      setMarkdown(md)
    }

    update()
    editor.on('update', update)

    return () => {
      editor.off('update', update)
    }
  }, [editor])

  return (
    <div className="markdown-demo">
      <div className="editor">{editor ? <EditorContent editor={editor} /> : <div>Loading editor…</div>}</div>
      <div className="preview">
        <pre>{markdown}</pre>
      </div>
    </div>
  )
}
