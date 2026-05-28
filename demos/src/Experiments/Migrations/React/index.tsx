import './styles.scss'

import type { JSONContent, MigrationOperation } from '@tiptap/core'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React from 'react'

import { migrationSummaries, migrations, sourceDocument } from './migrations.js'

type Panel = 'document' | 'log'

type MigrationLogEntry =
  | { id: string; kind: 'start'; fromVersion: number; migrationCount: number }
  | { id: string; kind: 'version'; fromVersion: number; toVersion: number; summary: string }
  | { id: string; kind: 'step'; step: MigrationOperation }

function formatStep(step: MigrationOperation): string {
  switch (step.type) {
    case 'renameNode':
      return `renameNode ${step.from} → ${step.to}`
    case 'renameAttr':
      return `renameAttr ${step.nodeType}.${step.from} → ${step.to}`
    case 'setAttr':
      return `setAttr ${step.nodeType}.${step.key} = ${JSON.stringify(step.value)}`
    case 'removeAttr':
      return `removeAttr ${step.nodeType}.${step.key}`
    case 'unwrapNode':
      return `unwrapNode ${step.nodeType}`
    case 'wrapNode':
      return `wrapNode ${step.nodeType}`
    case 'removeNode':
      return `removeNode ${step.nodeType}`
    case 'renameMark':
      return `renameMark ${step.from} → ${step.to}`
    case 'removeMark':
      return `removeMark ${step.markType}`
    case 'addMark':
      return `addMark ${step.markType}`
    case 'addMarkAttribute':
      return `addMarkAttribute ${step.markType}.${step.key}`
    case 'removeMarkAttribute':
      return `removeMarkAttribute ${step.markType}.${step.key}`
    case 'renameMarkAttribute':
      return `renameMarkAttribute ${step.markType}.${step.from} → ${step.to}`
    default:
      return 'unknown step'
  }
}

let logId = 0

function nextLogId(): string {
  logId += 1
  return String(logId)
}

const extensions = [StarterKit.configure({ heading: { levels: [1, 2, 3] } })]

export default () => {
  const [snapshots, setSnapshots] = React.useState<JSONContent[]>([sourceDocument])
  const [snapshotIndex, setSnapshotIndex] = React.useState(0)
  const [panel, setPanel] = React.useState<Panel>('document')
  const [log, setLog] = React.useState<MigrationLogEntry[]>([])
  const [documentVersion, setDocumentVersion] = React.useState(1)

  const editor = useEditor({
    extensions,
    data: {
      content: sourceDocument,
      documentVersion: 1,
    },
    migrations,
    onBeforeMigrate({ documentVersion: fromVersion, migrations: pending }) {
      setLog(entries => [
        ...entries,
        {
          id: nextLogId(),
          kind: 'start',
          fromVersion,
          migrationCount: pending.filter(m => m.version > fromVersion).length,
        },
      ])
    },
    onMigrate({ oldDocumentVersion, newDocumentVersion, newDocument }) {
      setSnapshots(previous => [...previous, newDocument])
      setSnapshotIndex(previous => previous + 1)
      setDocumentVersion(newDocumentVersion)
      setLog(entries => [
        ...entries,
        {
          id: nextLogId(),
          kind: 'version',
          fromVersion: oldDocumentVersion,
          toVersion: newDocumentVersion,
          summary: migrationSummaries[newDocumentVersion] ?? `Migration v${newDocumentVersion}`,
        },
      ])
    },
    onMigrateStep({ step }) {
      setLog(entries => [...entries, { id: nextLogId(), kind: 'step', step }])
    },
    onCreate({ editor: createdEditor }) {
      createdEditor.setOptions({ editable: false })
      setDocumentVersion(createdEditor.getDocumentVersion())
    },
  })

  if (!editor) {
    return null
  }

  const latestVersion = migrations.reduce((max, m) => Math.max(max, m.version), 1)

  return (
    <div className="migrations-demo">
      <div className="control-group sticky">
        <div className="hint">
          Loaded <span className="badge">documentVersion: 1</span> with legacy node types.
          Migrations run once on init up to <span className="badge">v{latestVersion}</span>. Current
          editor version: <span className="badge">v{documentVersion}</span>.
        </div>

        <div className="flex-row">
          <div>
            <div className="label-small">Document snapshots</div>
            <div className="button-group">
              {snapshots.map((_, index) => {
                const version = index + 1
                const summary = migrationSummaries[version] ?? `Version ${version}`

                return (
                  <button
                    key={version}
                    type="button"
                    className={snapshotIndex === index ? 'is-active' : ''}
                    onClick={() => setSnapshotIndex(index)}
                    title={summary}
                  >
                    v{version}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="switch-group">
            <label>
              <input
                type="radio"
                name="migrations-panel"
                checked={panel === 'document'}
                onChange={() => setPanel('document')}
              />
              JSON
            </label>
            <label>
              <input
                type="radio"
                name="migrations-panel"
                checked={panel === 'log'}
                onChange={() => setPanel('log')}
              />
              Migration log
            </label>
          </div>
        </div>
      </div>

      <div className="output-group">
        {panel === 'document' ? (
          <>
            <label>{migrationSummaries[snapshotIndex + 1] ?? `Version ${snapshotIndex + 1}`}</label>
            <pre>{JSON.stringify(snapshots[snapshotIndex], null, 2)}</pre>
          </>
        ) : (
          <>
            <label>Migration log ({log.length} events)</label>
            <ul className="migration-log">
              {log.map(entry => {
                if (entry.kind === 'start') {
                  return (
                    <li key={entry.id} className="migration-log-entry">
                      <span className="label-small">beforeMigrate</span>
                      <span>
                        Starting from v{entry.fromVersion} — {entry.migrationCount} migration(s)
                        pending
                      </span>
                    </li>
                  )
                }

                if (entry.kind === 'version') {
                  return (
                    <li key={entry.id} className="migration-log-entry">
                      <span className="label-small">migrate</span>
                      <span>
                        v{entry.fromVersion} → v{entry.toVersion}: {entry.summary}
                      </span>
                    </li>
                  )
                }

                return (
                  <li key={entry.id} className="migration-log-entry">
                    <span className="label-small">migrateStep</span>
                    <span>
                      <code>{entry.step.type}</code> {formatStep(entry.step)}
                    </span>
                  </li>
                )
              })}
            </ul>
          </>
        )}
      </div>

      <EditorContent editor={editor} />
    </div>
  )
}
