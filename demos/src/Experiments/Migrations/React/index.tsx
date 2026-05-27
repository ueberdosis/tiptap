import {
  createMigration,
  renameNode,
  renameAttr,
  setAttr,
  unwrapNode,
  renameMark,
  removeMark,
  JSONContent,
} from '@tiptap/core'
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
        { type: 'text', marks: [{ type: 'bold' }, { type: 'italic' }], text: 'Version 2' },
        { type: 'text', text: ': All node types and attributes were renamed' },
      ],
    },
    {
      type: 'legacyParagraph',
      content: [
        { type: 'text', marks: [{ type: 'bold' }, { type: 'italic' }], text: 'Version 3' },
        { type: 'text', text: ': The blockquote was unwrapped – its children moved one level up' },
      ],
    },
    {
      type: 'legacyParagraph',
      content: [
        { type: 'text', marks: [{ type: 'bold' }, { type: 'italic' }], text: 'Version 4' },
        { type: 'text', text: ': All headings were set to level 1' },
      ],
    },
    {
      type: 'legacyParagraph',
      content: [
        { type: 'text', marks: [{ type: 'bold' }, { type: 'italic' }], text: 'Marks' },
        { type: 'text', text: ' are being migrated too – ' },
        { type: 'text', marks: [{ type: 'code' }], text: 'bold → strike' },
        { type: 'text', text: ', code removed, and ' },
        {
          type: 'text',
          marks: [{ type: 'link', attrs: { href: '/internal' } }],
          text: 'normal links',
        },
        { type: 'text', text: ' stay, but ' },
        {
          type: 'text',
          marks: [{ type: 'link', attrs: { href: 'https://external.com', target: '_blank' } }],
          text: 'external links',
        },
        { type: 'text', text: ' get renamed to code.' },
      ],
    },
  ],
}

const migrations = [
  createMigration(2, [
    renameNode('legacyParagraph', 'paragraph'),
    renameNode('legacyHeading', 'heading'),
    renameNode('legacyListItem', 'listItem'),
    renameNode('legacyBlockquote', 'blockquote'),
    renameAttr('heading', 'depth', 'level'),
  ]),
  createMigration(3, [renameNode('legacyBulletList', 'bulletList')]),
  createMigration(4, [unwrapNode('blockquote')]),
  createMigration(5, [setAttr('heading', 'level', 1)]),
  createMigration(6, [renameMark('bold', 'strike')]),
  createMigration(7, [removeMark('code')]),
  createMigration(8, [renameMark('link', 'code', { attrs: { target: '_blank' } })]),
]

const extensions = [StarterKit.configure({ heading: { levels: [1, 2, 3] } })]

export default () => {
  const [versions, setVersions] = React.useState<JSONContent[]>([oldDoc])
  const [view, setView] = React.useState<number>(0)

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
    onMigrate({ oldDocumentVersion, newDocumentVersion, migration, newDocument }) {
      console.log(
        `Applied migration v${oldDocumentVersion} → v${newDocumentVersion}`,
        migration.steps,
      )
      setVersions(v => [...v, newDocument])
    },
    onMigrateStep({ step, before, after }) {
      console.log(`Step: ${step.type}`, step, { before, after })
    },
    onCreate({ editor }) {
      editor.setOptions({ editable: false })
    },
  })

  if (!editor) {
    return null
  }

  return (
    <>
      <div className="control-group">
        <div className="flex-row">
          <div className="button-group">
            {versions.map((_, i) => (
              <button
                key={i}
                className={view === i ? 'is-active' : ''}
                onClick={() => setView(v => (v === i ? 0 : i))}
              >
                Version {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="output-group">
        <label>Version {view + 1}</label>
        <pre>{JSON.stringify(versions[view], null, 2)}</pre>
      </div>

      <EditorContent editor={editor} />
    </>
  )
}
