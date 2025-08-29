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
      TaskItem.configure({ nested: true }),
      Mention,
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
      <div className="toolbar">
        <button type="button" onClick={() => editor?.chain().focus().toggleTaskList().run()} title="Toggle task list">
          Task list
        </button>

        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          title="Toggle bullet list"
        >
          Bullet list
        </button>

        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          title="Toggle ordered list"
        >
          Ordered list
        </button>

        <button
          type="button"
          onClick={() => {
            const url = 'https://tiptap.dev'
            // extend selection to link and set it; if no selection, insert a link-wrapped text
            if (!editor) {
              return
            }
            const hasSelection = editor.state.selection && editor.state.selection.from !== editor.state.selection.to
            if (hasSelection) {
              editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
            } else {
              // insert a link node around sample text
              editor.chain().focus().insertContent(`<a href="${url}">tiptap.dev</a>`).run()
            }
          }}
          title="Insert link"
        >
          Link
        </button>

        <button
          type="button"
          onClick={() => {
            if (!editor) {
              return
            }
            // Insert a youtube node with a preset url; extension expects e.g. src in attrs or parse HTML
            // Use insertContent with the youtube HTML wrapper used in initial content.
            const youtubeHTML = `\n<div data-youtube-video>\n  <iframe src="https://www.youtube.com/watch?v=dQw4w9WgXcQ" width="560" height="315"></iframe>\n</div>\n`
            editor.chain().focus().insertContent(youtubeHTML).run()
          }}
          title="Insert YouTube"
        >
          YouTube
        </button>
        <button
          type="button"
          onClick={() => {
            if (!editor) {
              return
            }
            const url = 'https://unsplash.it/600/300'
            editor.chain().focus().insertContent(`<img src="${url}" alt="Example image" />`).run()
          }}
          title="Insert image"
        >
          Image
        </button>

        <button
          type="button"
          onClick={() =>
            editor?.chain().focus().insertContent('<blockquote><p>Blockquote example</p></blockquote>').run()
          }
          title="Insert blockquote"
        >
          Blockquote
        </button>

        <button
          type="button"
          onClick={() => editor?.chain().focus().insertContent('<hr />').run()}
          title="Insert horizontal rule"
        >
          Horizontal rule
        </button>

        <button
          type="button"
          onClick={() =>
            editor
              ?.chain()
              .focus()
              .insertContent(
                `<details><summary>Summary</summary><div data-type="details-content"><p>Details content</p></div></details>`,
              )
              .run()
          }
          title="Insert details block"
        >
          Details
        </button>

        <button
          type="button"
          onClick={() => {
            if (!editor) {
              return
            }
            // insert inline math if no selection
            const latex = '3 * 5 = 15'
            const hasSelection = !editor.state.selection.empty
            if (hasSelection) {
              editor.chain().focus().insertInlineMath({ latex }).run()
            } else {
              editor.chain().focus().insertInlineMath({ latex }).run()
            }
          }}
          title="Insert inline math"
        >
          Inline math
        </button>

        <button
          type="button"
          onClick={() => {
            if (!editor) {
              return
            }
            const latex = '\\int_0^1 x^2 dx'
            const hasSelection = !editor.state.selection.empty
            if (hasSelection) {
              editor.chain().focus().insertBlockMath({ latex }).run()
            } else {
              editor.chain().focus().insertBlockMath({ latex }).run()
            }
          }}
          title="Insert block math"
        >
          Block math
        </button>

        <button
          type="button"
          onClick={() => {
            if (!editor) {
              return
            }
            // Insert a mention span (as in initial content)
            editor
              .chain()
              .focus()
              .insertContent('<span data-type="mention" data-id="1" data-label="John Doe"></span>')
              .run()
          }}
          title="Insert mention"
        >
          Mention
        </button>
      </div>

      <div className="split">
        <div className="editor">{editor ? <EditorContent editor={editor} /> : <div>Loading editor…</div>}</div>
        <div className="preview">
          <pre>{markdown}</pre>
        </div>
      </div>
    </div>
  )
}
