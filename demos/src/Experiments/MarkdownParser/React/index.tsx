import './styles.scss'

import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React, { useState } from 'react'

export default () => {
  const [markdownInput, setMarkdownInput] = useState(`# Welcome to Markdown Parser Demo

This demo showcases **bidirectional** markdown support in Tiptap.

## Features

- **Bold text** and *italic text*
- \`inline code\`
- [Links](https://tiptap.dev)
- Lists and more!

### Try editing the markdown on the left:

1. Edit the markdown text
2. Click "Parse Markdown"
3. See it render in the editor!

You can also edit in the editor and see the markdown update.`)

  const [error, setError] = useState<string | null>(null)
  const [showJson, setShowJson] = useState(false)

  const editor = useEditor({
    extensions: [StarterKit],
    content: '<p>Click "Parse Markdown" to load content from the left panel.</p>',
  })

  const parseMarkdown = () => {
    if (!editor || !editor.markdown) {
      setError('Editor or MarkdownManager not available')
      return
    }

    try {
      setError(null)
      // Use the MarkdownManager to parse markdown to JSON
      const parsedJson = editor.markdown.parse(markdownInput)
      console.log(parsedJson, markdownInput)

      // Set the parsed content in the editor
      editor.commands.setContent(parsedJson)
    } catch (err) {
      setError(`Error parsing markdown: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  const getEditorAsMarkdown = () => {
    if (!editor) {
      return ''
    }

    try {
      return editor.getMarkdown()
    } catch {
      return editor.getText()
    }
  }

  const getCurrentJson = () => {
    if (!editor) {
      return null
    }
    return editor.getJSON()
  }

  return (
    <div className="markdown-parser-demo">
      <div className="controls">
        <button type="button" onClick={parseMarkdown} disabled={!editor || !markdownInput.trim()}>
          Parse Markdown →
        </button>

        <button type="button" onClick={() => setShowJson(!showJson)}>
          {showJson ? 'Hide' : 'Show'} JSON
        </button>

        <button
          type="button"
          onClick={() => {
            if (editor) {
              const markdown = getEditorAsMarkdown()
              setMarkdownInput(markdown)
            }
          }}
        >
          ← Extract Markdown
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="split">
        <div className="input-panel">
          <div className="panel-label">Markdown Input</div>
          <textarea
            className="markdown-input"
            value={markdownInput}
            onChange={e => setMarkdownInput(e.target.value)}
            placeholder="Enter markdown here..."
          />
        </div>

        <div className="editor-panel">
          <div className="panel-label">Tiptap Editor</div>
          <div className="editor-container">
            {editor ? <EditorContent editor={editor} /> : <div>Loading editor…</div>}
          </div>
        </div>
      </div>

      {showJson && (
        <div className="json-preview">
          <strong>Current Editor JSON:</strong>
          <pre>{JSON.stringify(getCurrentJson(), null, 2)}</pre>
        </div>
      )}
    </div>
  )
}
