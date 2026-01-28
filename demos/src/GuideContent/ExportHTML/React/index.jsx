import './styles.scss'

import { useEditor, Tiptap } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React, { useCallback, useEffect, useState } from 'react'

export default () => {
  const [html, setHtml] = useState(null)
  const editor = useEditor({
    content: `
        <p>
          Wow, this editor instance exports its content as HTML.
        </p>
      `,
    extensions: [StarterKit],
  })

  useEffect(() => {
    if (!editor) {
      return undefined
    }

    // Get the initial content …
    setHtml(editor.getHTML())

    // … and get the content after every change.
    editor.on('update', () => {
      setHtml(editor.getHTML())
    })
  }, [editor])

  const setContent = useCallback(() => {
    // You can pass a HTML document to the editor.
    editor.commands.setContent(
      `
        <p>
          It’s 19871. You can’t turn on a radio, or go to a mall without hearing Olivia Newton-John’s hit song, Physical.
        </p>
      `,
    )

    // It’s likely that you’d like to focus the Editor after most commands.
    editor.commands.focus()
  }, [editor])

  const clearContent = useCallback(() => {
    editor.chain().clearContent(true).focus().run()
  }, [editor])

  if (!editor) {
    return null
  }

  return (
    <>
      <div className="control-group">
        <div className="button-group">
          <button className="button" onClick={setContent}>
            Set content
          </button>
          <button className="button" onClick={clearContent}>
            Clear content
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'is-active' : ''}
          >
            Bold
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'is-active' : ''}
          >
            Italic
          </button>
        </div>
      </div>

      <Tiptap instance={editor}>
        <Tiptap.Content />
      </Tiptap>

      <div className="output-group">
        <label>HTML</label>
        <pre>
          <code>{html}</code>
        </pre>
      </div>
    </>
  )
}
