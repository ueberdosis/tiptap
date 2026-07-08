import './styles.scss'

import { EditorContent, useEditor } from '@tiptap/react-experimental'
import StarterKit from '@tiptap/starter-kit'
import React, { useState } from 'react'

import SearchHighlight, { searchHighlightKey } from './Extension.js'

export default () => {
  const [term, setTerm] = useState('')
  const editor = useEditor({
    extensions: [StarterKit, SearchHighlight],
    content: `
    <h2>Decorations, rendered by React</h2>
    <p>
      This demo shows all three decoration kinds under the experimental React
      renderer: type into the search field to highlight matches with
      <strong>inline decorations</strong>, each match gets a numbered
      <strong>React widget</strong> badge, and the block your cursor is in
      carries a <strong>node decoration</strong>.
    </p>
    <p>
      Decorations decorate without touching the document: searching for
      "decoration" highlights this paragraph's decorations, but the text
      stays exactly what it was.
    </p>
    `,
  })

  const search = (value: string) => {
    setTerm(value)
    editor.view.dispatch(editor.state.tr.setMeta(searchHighlightKey, value))
  }

  return (
    <>
      <div className="control-group">
        <label>
          Search:{' '}
          <input
            type="text"
            value={term}
            placeholder="Type to highlight matches…"
            onChange={event => search(event.target.value)}
          />
        </label>
      </div>
      <EditorContent editor={editor} />
    </>
  )
}
