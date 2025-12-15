import { BubbleMenu, type Editor } from '@tiptap/react'
import React, { useState } from 'react'

import type { AIAction } from '../../types/index.ts'

interface AIBubbleMenuProps {
  editor: Editor
  onAction: (action: AIAction, customPrompt?: string) => void
  isProcessing: boolean
  currentAction: AIAction | null
}

const QUICK_ACTIONS: Array<{ action: AIAction; label: string; icon: string }> = [
  { action: 'improve', label: 'Improve', icon: '✨' },
  { action: 'simplify', label: 'Simplify', icon: '📝' },
  { action: 'expand', label: 'Expand', icon: '📖' },
  { action: 'fix-grammar', label: 'Fix', icon: '✓' },
]

export function AIBubbleMenu({ editor, onAction, isProcessing, currentAction }: AIBubbleMenuProps) {
  const [showCustom, setShowCustom] = useState(false)
  const [customPrompt, setCustomPrompt] = useState('')

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (customPrompt.trim()) {
      onAction('custom', customPrompt)
      setCustomPrompt('')
      setShowCustom(false)
    }
  }

  return (
    <BubbleMenu
      editor={editor}
      tippyOptions={{
        duration: 100,
        placement: 'top',
        maxWidth: 'none',
      }}
      shouldShow={({ editor, state }) => {
        // Only show when there's a text selection
        const { from, to } = state.selection
        const text = state.doc.textBetween(from, to, ' ')
        return !editor.state.selection.empty && text.trim().length > 0
      }}
    >
      <div className="ai-bubble-menu">
        {isProcessing ? (
          <div className="ai-bubble-processing">
            <span className="spinner" />
            <span>
              {currentAction === 'improve' && 'Improving...'}
              {currentAction === 'simplify' && 'Simplifying...'}
              {currentAction === 'expand' && 'Expanding...'}
              {currentAction === 'fix-grammar' && 'Fixing...'}
              {currentAction === 'custom' && 'Processing...'}
              {!currentAction && 'Processing...'}
            </span>
          </div>
        ) : showCustom ? (
          <form className="ai-bubble-custom" onSubmit={handleCustomSubmit}>
            <input
              type="text"
              value={customPrompt}
              onChange={e => setCustomPrompt(e.target.value)}
              placeholder="Enter custom instruction..."
              autoFocus
            />
            <button type="submit" disabled={!customPrompt.trim()}>
              Go
            </button>
            <button type="button" onClick={() => setShowCustom(false)}>
              ✕
            </button>
          </form>
        ) : (
          <div className="ai-bubble-actions">
            {QUICK_ACTIONS.map(({ action, label, icon }) => (
              <button key={action} onClick={() => onAction(action)} className="ai-bubble-btn" title={label}>
                <span className="icon">{icon}</span>
                <span className="label">{label}</span>
              </button>
            ))}
            <button onClick={() => setShowCustom(true)} className="ai-bubble-btn custom" title="Custom">
              <span className="icon">💭</span>
              <span className="label">Custom</span>
            </button>
          </div>
        )}
      </div>
    </BubbleMenu>
  )
}
