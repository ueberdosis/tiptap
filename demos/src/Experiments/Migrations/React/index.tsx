import { createMigration, renameNode, renameAttr, setAttr, unwrapNode } from '@tiptap/core'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React from 'react'

const oldDoc = {
  type: 'doc',
  content: [
    {
      type: 'legacyHeading',
      attrs: { depth: 1 },
      content: [{ type: 'text', text: 'Migration Demo' }],
    },
    {
      type: 'legacyParagraph',
      content: [
        { type: 'text', text: 'This document was saved in ' },
        { type: 'text', marks: [{ type: 'bold' }], text: 'version 1' },
        { type: 'text', text: ' of the schema. The editor runs ' },
        { type: 'text', marks: [{ type: 'code' }], text: 'migrations' },
        { type: 'text', text: ' automatically on load.' },
      ],
    },
    {
      type: 'legacyBlockquote',
      content: [
        {
          type: 'legacyParagraph',
          content: [{ type: 'text', text: 'Blockquote with nested content' }],
        },
        {
          type: 'legacyBulletList',
          content: [
            {
              type: 'legacyListItem',
              content: [
                {
                  type: 'legacyParagraph',
                  content: [{ type: 'text', text: 'List inside a blockquote' }],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'legacyHeading',
      attrs: { depth: 2 },
      content: [{ type: 'text', text: 'Deeply Nested Content' }],
    },
    {
      type: 'legacyBulletList',
      content: [
        {
          type: 'legacyListItem',
          content: [
            {
              type: 'legacyParagraph',
              content: [{ type: 'text', text: 'Level 1' }],
            },
            {
              type: 'legacyBulletList',
              content: [
                {
                  type: 'legacyListItem',
                  content: [
                    {
                      type: 'legacyParagraph',
                      content: [
                        { type: 'text', text: 'Level 2 – bottom-up walk handles deep nesting' },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'legacyHeading',
      attrs: { depth: 2 },
      content: [{ type: 'text', text: 'What changed?' }],
    },
    {
      type: 'legacyParagraph',
      content: [
        { type: 'text', marks: [{ type: 'bold' }], text: 'Version 2' },
        { type: 'text', text: ': All node types and attributes were renamed' },
      ],
    },
    {
      type: 'legacyParagraph',
      content: [
        { type: 'text', marks: [{ type: 'bold' }], text: 'Version 3' },
        { type: 'text', text: ': The blockquote was unwrapped – its children moved one level up' },
      ],
    },
    {
      type: 'legacyParagraph',
      content: [
        { type: 'text', marks: [{ type: 'bold' }], text: 'Version 4' },
        { type: 'text', text: ': All headings were set to level 1' },
      ],
    },
  ],
}

const migrations = [
  createMigration(2, [
    renameNode('legacyParagraph', 'paragraph'),
    renameNode('legacyHeading', 'heading'),
    renameNode('legacyListItem', 'listItem'),
    renameNode('legacyBulletList', 'bulletList'),
    renameNode('legacyBlockquote', 'blockquote'),
    renameAttr('heading', 'depth', 'level'),
  ]),
  createMigration(3, [unwrapNode('blockquote')]),
  createMigration(4, [setAttr('heading', 'level', 1)]),
]

const labels = [
  'Version 2: Renamed legacyParagraph → paragraph, legacyHeading → heading, …',
  'Version 2: Renamed attrs (depth → level on headings)',
  'Version 3: Unwrapped blockquote – children moved one level up',
  'Version 4: Set all headings to level 1',
]

const extensions = [StarterKit.configure({ heading: { levels: [1, 2, 3] } })]

export default () => {
  const [view, setView] = React.useState<'old' | 'migrated' | null>('migrated')

  const editor = useEditor({
    extensions,
    data: {
      content: oldDoc,
      documentVersion: 1,
    },
    migrations,
    onBeforeMigrate({ documentVersion, migrations: ms }) {
      console.log(`Migrating from v${documentVersion} with ${ms.length} migrations`)
    },
    onMigrate({ oldDocumentVersion, newDocumentVersion, migrations: ms }) {
      console.log(`Migrated from v${oldDocumentVersion} to v${newDocumentVersion}`)
    },
    onCreate({ editor }) {
      editor.setOptions({ editable: false })
    },
  })

  if (!editor) {
    return null
  }

  const data = editor.getData()

  return (
    <>
      <div className="control-group">
        <div className="flex-row">
          <div>
            v{data.documentVersion} — {migrations.length} migrations
          </div>

          <div className="button-group">
            <button
              className={view === 'old' ? 'is-active' : ''}
              onClick={() => setView(v => (v === 'old' ? null : 'old'))}
            >
              Old JSON
            </button>
            <button
              className={view === 'migrated' ? 'is-active' : ''}
              onClick={() => setView(v => (v === 'migrated' ? null : 'migrated'))}
            >
              Migrated JSON
            </button>
          </div>
        </div>
      </div>

      <div className="output-group">
        <label>Applied migrations</label>
        <ol>
          {labels.map((msg, i) => (
            <li key={i}>{msg}</li>
          ))}
        </ol>
      </div>

      {view === 'old' && (
        <div className="output-group">
          <label>Old document (version 1)</label>
          <pre>{JSON.stringify(oldDoc, null, 2)}</pre>
        </div>
      )}

      {view === 'migrated' && (
        <div className="output-group">
          <label>Migrated document (version {data.documentVersion})</label>
          <pre>{JSON.stringify(data.content, null, 2)}</pre>
        </div>
      )}

      <EditorContent editor={editor} />
    </>
  )
}
