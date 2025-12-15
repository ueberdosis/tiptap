import React from 'react'

import type { DocumentVersion } from '../../types'

interface VersionBarProps {
  versions: DocumentVersion[]
  currentVersionId: string | null
  hasUnsavedChanges: boolean
  onSelectVersion: (versionId: string) => void
}

function formatDate(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  // Less than a minute
  if (diff < 60000) {
    return 'just now'
  }

  // Less than an hour
  if (diff < 3600000) {
    const mins = Math.floor(diff / 60000)
    return `${mins}m ago`
  }

  // Less than a day
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000)
    return `${hours}h ago`
  }

  // Otherwise, show date
  return date.toLocaleDateString()
}

export function VersionBar({ versions, currentVersionId, hasUnsavedChanges, onSelectVersion }: VersionBarProps) {
  if (versions.length === 0) {
    return (
      <div className="version-bar empty">
        <span className="no-versions">No saved versions yet</span>
      </div>
    )
  }

  return (
    <div className="version-bar">
      <div className="version-bar-label">History:</div>
      <div className="version-timeline">
        {versions.map((version, index) => {
          const isCurrent = version.id === currentVersionId
          const isLast = index === versions.length - 1

          return (
            <React.Fragment key={version.id}>
              <button
                className={`version-node ${isCurrent ? 'current' : ''} ${version.createdBy}`}
                onClick={() => onSelectVersion(version.id)}
                title={`v${version.version} - ${version.label || version.createdBy} - ${formatDate(version.createdAt)}`}
              >
                <span className="version-dot">{version.createdBy === 'ai' ? '🤖' : '👤'}</span>
                <span className="version-label">v{version.version}</span>
              </button>
              {!isLast && <span className="version-connector">→</span>}
            </React.Fragment>
          )
        })}

        {hasUnsavedChanges && (
          <>
            <span className="version-connector">→</span>
            <div className="version-node unsaved">
              <span className="version-dot">•</span>
              <span className="version-label">Unsaved</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
