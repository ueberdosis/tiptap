import '../styles.scss'

import StarterKit from '@tiptap/starter-kit'
import { EditorContent, useEditor } from '@tiptap/react'
import React, { useState } from 'react'

import { HighlightDecorations } from '../highlight-decorations.js'

const initialTerm = 'tiptap'

export default () => {
  const [term, setTerm] = useState(initialTerm)

  const editor = useEditor({
    extensions: [StarterKit, HighlightDecorations.configure({ term: initialTerm })],
    content: `
      <h2>The Decorations API</h2>
      <p>
        With the new Decorations API, an extension can declare its decorations the
        same way it declares commands or keymaps. This Tiptap demo highlights every
        occurrence of a search term using an <strong>inline</strong> decoration, adds
        a <strong>widget</strong> marker before each match, and outlines headings with
        a <strong>node</strong> decoration.
      </p>
      <h2>Try it out</h2>
      <p>
        Change the search term below — Tiptap forces a recompute with
        <code>updateDecorations</code>. Editing the document recomputes automatically.
      </p>
    `,
  })

  const handleTermChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value

    setTerm(value)

    if (editor) {
      editor.storage.highlightDecorations.term = value
      editor.commands.updateDecorations('highlightDecorations')
    }
  }

  if (!editor) {
    return null
  }

  return (
    <>
      <div className="control-group">
        <div className="button-group">
          <label>
            Highlight term:{' '}
            <input type="text" value={term} onChange={handleTermChange} placeholder="Search term" />
          </label>
          <button onClick={() => editor.commands.updateDecorations()}>Re-apply</button>
        </div>
      </div>
      <EditorContent editor={editor} />
    </>
  )
}
