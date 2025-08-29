import './styles.scss'

import { Details, DetailsContent, DetailsSummary } from '@tiptap/extension-details'
import Emoji from '@tiptap/extension-emoji'
import Image from '@tiptap/extension-image'
import { TaskItem, TaskList } from '@tiptap/extension-list'
import { Mathematics } from '@tiptap/extension-mathematics'
import { Mention } from '@tiptap/extension-mention'
import { Youtube } from '@tiptap/extension-youtube'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React, { useEffect, useState } from 'react'

export default () => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Emoji,
      Details,
      DetailsSummary,
      DetailsContent,
      Image,
      TaskList,
      Mention,
      TaskItem.configure({ nested: true }),
      Mathematics,
      Youtube,
    ],
    content: `
      <h1>Hello World. This is a test with Markdown</h1>
      <p>We have to see how well this translates now.</p>
      <div data-youtube-video>
        <iframe src="https://music.youtube.com/watch?v=iQabhtiG4h4" start="60" width="800" height="600"></iframe>
      </div>
      <p>Now I'm mentioning <span data-type="mention" data-id="1" data-label="John Doe"></span></p>
      <img src="https://unsplash.it/800/300" alt="A placeholder" />
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
