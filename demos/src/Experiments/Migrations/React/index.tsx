import './styles.scss'

import { createMigration, setAttr } from '@tiptap/core'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React from 'react'

const migrations = [
  createMigration(2, [
    { type: 'renameNode', from: 'oldParagraph', to: 'paragraph' },
    { type: 'renameNode', from: 'oldHeading', to: 'heading' },
    { type: 'renameAttr', nodeType: 'heading', from: 'oldLevel', to: 'level' },
  ]),
  createMigration(3, [setAttr('heading', 'level', 1)]),
]

const oldDoc = {
  type: 'doc',
  content: [
    {
      type: 'oldParagraph',
      content: [
        {
          type: 'text',
          text: 'This document was saved in an old format. The editor migrated it automatically.',
        },
      ],
    },
    {
      type: 'oldHeading',
      attrs: { oldLevel: 2 },
      content: [
        {
          type: 'text',
          text: 'Everything still works',
        },
      ],
    },
    {
      type: 'oldParagraph',
      content: [
        {
          type: 'text',
          text: 'Try editing this content – the migrations only run once during initialization.',
        },
      ],
    },
  ],
}

const extensions = [StarterKit]

export default () => {
  const [ranMigrations, setRanMigrations] = React.useState<string[]>([])

  const editor = useEditor({
    extensions,
    data: {
      content: oldDoc,
      documentVersion: 1,
    },
    migrations,
    onCreate({ editor }) {
      const version = editor.getData().documentVersion
      setRanMigrations([
        'Renamed "oldParagraph" → "paragraph"',
        'Renamed "oldHeading" → "heading"',
        'Renamed "oldLevel" → "level"',
        `Bumped document version to ${version}`,
      ])
    },
  })

  if (!editor) {
    return null
  }

  const data = editor.getData()

  return (
    <>
      <div className="control-group">
        <div className="migration-badge">
          Document version: <span className="version">{data.documentVersion}</span>
        </div>
        <div className="migration-badge applied">
          Migrations applied: <span className="version">{ranMigrations.length}</span>
        </div>
      </div>

      {ranMigrations.length > 0 && (
        <div className="migration-log">
          <strong>Applied migrations:</strong>
          <ul>
            {ranMigrations.map((msg, i) => (
              <li key={i}>{msg}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="control-group">
        <button
          className={`button ${editor.isEditable ? 'is-primary' : 'is-warning'}`}
          onClick={() => editor.setEditable(!editor.isEditable)}
        >
          {editor.isEditable ? 'Disable editing' : 'Enable editing'}
        </button>
      </div>

      <EditorContent editor={editor} />
    </>
  )
}
