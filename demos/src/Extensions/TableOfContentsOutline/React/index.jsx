import '../styles.scss'

import {
  filterTableOfContents,
  resolveTableOfContents,
  TableOfContents,
} from '@tiptap/extension-table-of-contents'
import { TextSelection } from '@tiptap/pm/state'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React, { useState } from 'react'

import { content } from '../content.js'

const allLevels = [2, 3, 4]
const depthChoices = [
  { label: 'All', value: undefined },
  { label: '1', value: 1 },
  { label: '2', value: 2 },
]

export default () => {
  const [headings, setHeadings] = useState([])
  const [levels, setLevels] = useState(allLevels)
  const [maxDepth, setMaxDepth] = useState(undefined)

  const editor = useEditor({
    extensions: [StarterKit, TableOfContents.configure({ updateOnTransaction: false })],
    content,
    onCreate: ({ editor: currentEditor }) => {
      setHeadings(resolveTableOfContents(currentEditor.state.doc))
    },
    onUpdate: ({ editor: currentEditor }) => {
      setHeadings(resolveTableOfContents(currentEditor.state.doc))
    },
  })

  if (!editor) {
    return null
  }

  const rows = filterTableOfContents(headings, { levels, maxDepth })

  const toggleLevel = level => {
    setLevels(current =>
      current.includes(level)
        ? current.filter(item => item !== level)
        : [...current, level].sort((left, right) => left - right),
    )
  }

  const goToHeading = heading => {
    const { tr } = editor.state

    tr.setSelection(TextSelection.near(tr.doc.resolve(heading.pos + 1)))
    tr.scrollIntoView()
    editor.view.dispatch(tr)
    editor.view.focus()
  }

  return (
    <div className="col-group">
      <div className="main">
        <EditorContent editor={editor} />
      </div>
      <div className="sidebar">
        <div className="sidebar-options">
          <div className="label-small">Levels</div>
          <div className="button-group">
            {allLevels.map(level => (
              <button
                key={level}
                className={levels.includes(level) ? 'is-active' : ''}
                onClick={() => toggleLevel(level)}
              >
                H{level}
              </button>
            ))}
          </div>
          <div className="label-small">Depth</div>
          <div className="button-group">
            {depthChoices.map(choice => (
              <button
                key={choice.label}
                className={maxDepth === choice.value ? 'is-active' : ''}
                onClick={() => setMaxDepth(choice.value)}
              >
                {choice.label}
              </button>
            ))}
          </div>
          <div className="label-large">Outline</div>
          {rows.length === 0 ? (
            <p className="empty-state">No headings to show.</p>
          ) : (
            <ol className="outline">
              {rows.map(row => (
                <li key={row.pos} style={{ '--depth': row.depth }} data-level={row.level}>
                  <button type="button" onClick={() => goToHeading(row)}>
                    {row.textContent}
                  </button>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  )
}
