import React from 'react'

import type { Section, SectionStatus } from '../../types/index.ts'

interface SectionProgressProps {
  sections: Section[]
  currentSectionId?: string
  onSectionClick?: (section: Section) => void
}

const STATUS_ICONS: Record<SectionStatus, string> = {
  pending: '○',
  in_progress: '◐',
  complete: '●',
  in_review: '◑',
}

const STATUS_COLORS: Record<SectionStatus, string> = {
  pending: 'var(--gray-3)',
  in_progress: 'var(--yellow)',
  complete: 'var(--green)',
  in_review: 'var(--purple)',
}

export function SectionProgress({ sections, currentSectionId, onSectionClick }: SectionProgressProps) {
  const completedCount = sections.filter(s => s.status === 'complete').length
  const totalCount = sections.length

  if (sections.length === 0) {
    return null
  }

  return (
    <div className="section-progress">
      <div className="progress-header">
        <span className="progress-title">Section Progress</span>
        <span className="progress-count">
          {completedCount}/{totalCount} complete
        </span>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${(completedCount / totalCount) * 100}%` }} />
      </div>

      <div className="section-list">
        {sections.map(section => (
          <button
            key={section.id}
            className={`section-item ${section.id === currentSectionId ? 'current' : ''}`}
            onClick={() => onSectionClick?.(section)}
            style={{ paddingLeft: `${(section.level - 1) * 12 + 8}px` }}
          >
            <span className="section-status" style={{ color: STATUS_COLORS[section.status] }}>
              {STATUS_ICONS[section.status]}
            </span>
            <span className="section-title">{section.title}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
