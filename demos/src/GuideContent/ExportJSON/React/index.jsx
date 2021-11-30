import React, { useState, useEffect, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import './styles.scss'

export default () => {
  const [json, setJson] = useState(null)
  const editor = useEditor({
    content: `
        <p>
          Wow, this editor instance exports its content as JSON.
        </p>
      `,
    extensions: [StarterKit],
  })

  useEffect(() => {
    if (!editor) {
      return null
    }

    // Get the initial content …
    setJson(editor.getJSON())

    // … and get the content after every change.
    editor.on('update', () => {
      setJson(editor.getJSON())
    })
  }, [editor])

  const setContent = useCallback(() => {
    // You can pass a JSON document to the editor.
    editor.commands.setContent(
      {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'It’s 19871. You can’t turn on a radio, or go to a mall without hearing Olivia Newton-John’s hit song, Physical.',
              },
            ],
          },
        ],
      },
      true,
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
      <div className="actions">
        <button className="button" onClick={setContent}>
          Set Content
        </button>
        <button className="button" onClick={clearContent}>
          Clear Content
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

      <EditorContent editor={editor} />

      <div className="export">
        <h3>JSON</h3>
        <pre>
          <code>{JSON.stringify(json, null, 2)}</code>
        </pre>
      </div>
    </>
  )
}
