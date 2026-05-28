import './styles.scss'

import { type JSONContent } from '@tiptap/core'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React from 'react'

import { LOCAL_MAX_MIGRATION_VERSION, migrations } from './migrations.js'

/** Simulates a document saved by a newer app build (migrations up to v10). */
const FUTURE_DOCUMENT_VERSION = LOCAL_MAX_MIGRATION_VERSION + 5

const savedDocument: JSONContent = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'This JSON was persisted by a newer editor build (documentVersion: ',
        },
        {
          type: 'text',
          marks: [{ type: 'bold' }],
          text: String(FUTURE_DOCUMENT_VERSION),
        },
        {
          type: 'text',
          text: '). This demo only ships migrations up to v',
        },
        {
          type: 'text',
          marks: [{ type: 'bold' }],
          text: String(LOCAL_MAX_MIGRATION_VERSION),
        },
        { type: 'text', text: '.' },
      ],
    },
  ],
}

export default () => {
  const [loadDocumentVersion, setLoadDocumentVersion] = React.useState(LOCAL_MAX_MIGRATION_VERSION)
  const [migrationError, setMigrationError] = React.useState<Error | null>(null)
  const [runtimeBumpCount, setRuntimeBumpCount] = React.useState(0)

  const editor = useEditor(
    {
      extensions: [StarterKit],
      editable: false,
      data: {
        content: savedDocument,
        documentVersion: loadDocumentVersion,
        meta: { source: 'migrations-outdated-demo' },
      },
      migrations,
      onMigrateError: ({ error }) => setMigrationError(error),
    },
    [loadDocumentVersion],
  )

  const loadCompatible = () => {
    setMigrationError(null)
    setLoadDocumentVersion(LOCAL_MAX_MIGRATION_VERSION)
  }

  const loadNewer = () => {
    setMigrationError(null)
    setLoadDocumentVersion(FUTURE_DOCUMENT_VERSION)
  }

  const simulateRuntimeVersionBump = () => {
    if (!editor) {
      return
    }

    setMigrationError(null)
    editor.setDocumentVersion(FUTURE_DOCUMENT_VERSION)
    setRuntimeBumpCount(count => count + 1)
  }

  const status = migrationError
    ? 'error'
    : editor
      ? 'ready'
      : loadDocumentVersion > LOCAL_MAX_MIGRATION_VERSION
        ? 'error'
        : 'loading'

  return (
    <div className="migrations-outdated-demo">
      <div className="control-group sticky">
        <div className="hint">
          Your app binary defines migrations up to{' '}
          <span className="badge">v{LOCAL_MAX_MIGRATION_VERSION}</span>. If persisted content has a
          higher <span className="badge">documentVersion</span>, the editor refuses to start — the
          local build is outdated and cannot safely read that document. After a compatible load, use
          the runtime bump to mimic a remote Yjs peer writing a newer version.
        </div>

        <div className="status-grid">
          <div className="status-card">
            <span className="label-small">Local migrations (max)</span>
            <strong>v{LOCAL_MAX_MIGRATION_VERSION}</strong>
          </div>
          <div className="status-card">
            <span className="label-small">Simulated saved document</span>
            <strong>v{FUTURE_DOCUMENT_VERSION}</strong>
          </div>
          <div className="status-card">
            <span className="label-small">Last load attempt</span>
            <strong>
              v{loadDocumentVersion} · {status}
            </strong>
          </div>
        </div>

        <div className="button-group">
          <button
            type="button"
            className={status === 'ready' ? 'is-active' : ''}
            onClick={loadCompatible}
          >
            Load compatible document (v{LOCAL_MAX_MIGRATION_VERSION})
          </button>
          <button
            type="button"
            className={
              status === 'error' && loadDocumentVersion > LOCAL_MAX_MIGRATION_VERSION
                ? 'is-active'
                : ''
            }
            onClick={loadNewer}
          >
            Load newer document (v{FUTURE_DOCUMENT_VERSION})
          </button>
          <button type="button" disabled={!editor} onClick={simulateRuntimeVersionBump}>
            Runtime version bump (v{FUTURE_DOCUMENT_VERSION})
            {runtimeBumpCount > 0 ? ` · ${runtimeBumpCount}×` : ''}
          </button>
        </div>
      </div>

      <div className="output-group">
        {migrationError ? (
          <>
            <label>onMigrateError</label>
            <div className="hint error">Outdated app — cannot open this document</div>
            <pre className="error-detail">{migrationError.message}</pre>
          </>
        ) : editor ? (
          <>
            <label>Editor initialized</label>
            <div className="hint">
              documentVersion <span className="badge">v{loadDocumentVersion}</span> is within the
              supported range (≤ v{LOCAL_MAX_MIGRATION_VERSION}).
            </div>
          </>
        ) : null}
      </div>

      {editor ? <EditorContent editor={editor} /> : null}
    </div>
  )
}
