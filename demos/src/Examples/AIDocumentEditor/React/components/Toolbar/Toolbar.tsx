import type { Editor } from '@tiptap/react'
import { useEditorState } from '@tiptap/react'
import React from 'react'

import type { AIAction } from '../../types/index.ts'

interface ToolbarProps {
  editor: Editor
  onSaveVersion: () => void
  onDiscard: () => void
  hasUnsavedChanges: boolean
  isSaving: boolean
  currentVersion?: string
  onAIAction?: (action: AIAction) => void
  isAIProcessing?: boolean
}

export function Toolbar({
  editor,
  onSaveVersion,
  onDiscard,
  hasUnsavedChanges,
  isSaving,
  currentVersion,
  onAIAction,
  isAIProcessing,
}: ToolbarProps) {
  const editorState = useEditorState({
    editor,
    selector: ctx => ({
      isBold: ctx.editor.isActive('bold'),
      isItalic: ctx.editor.isActive('italic'),
      isStrike: ctx.editor.isActive('strike'),
      isUnderline: ctx.editor.isActive('underline'),
      isCode: ctx.editor.isActive('code'),
      isParagraph: ctx.editor.isActive('paragraph'),
      isH1: ctx.editor.isActive('heading', { level: 1 }),
      isH2: ctx.editor.isActive('heading', { level: 2 }),
      isH3: ctx.editor.isActive('heading', { level: 3 }),
      isBulletList: ctx.editor.isActive('bulletList'),
      isOrderedList: ctx.editor.isActive('orderedList'),
      isBlockquote: ctx.editor.isActive('blockquote'),
      isCodeBlock: ctx.editor.isActive('codeBlock'),
      canUndo: ctx.editor.can().undo(),
      canRedo: ctx.editor.can().redo(),
      hasSelection: !ctx.editor.state.selection.empty,
    }),
  })

  const [showAIMenu, setShowAIMenu] = React.useState(false)

  const aiActions: Array<{ action: AIAction; label: string; icon: string }> = [
    { action: 'improve', label: 'Improve Writing', icon: '✨' },
    { action: 'simplify', label: 'Simplify', icon: '📝' },
    { action: 'expand', label: 'Expand', icon: '📖' },
    { action: 'summarize', label: 'Summarize', icon: '📋' },
    { action: 'fix-grammar', label: 'Fix Grammar', icon: '✓' },
    { action: 'formal', label: 'Make Formal', icon: '🎩' },
    { action: 'casual', label: 'Make Casual', icon: '💬' },
  ]

  return (
    <div className="ai-editor-toolbar">
      {/* Formatting buttons */}
      <div className="toolbar-group">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editorState.isBold ? 'is-active' : ''}
          title="Bold"
        >
          <strong>B</strong>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editorState.isItalic ? 'is-active' : ''}
          title="Italic"
        >
          <em>I</em>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editorState.isUnderline ? 'is-active' : ''}
          title="Underline"
        >
          <u>U</u>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editorState.isStrike ? 'is-active' : ''}
          title="Strikethrough"
        >
          <s>S</s>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={editorState.isCode ? 'is-active' : ''}
          title="Code"
        >
          {'</>'}
        </button>
      </div>

      <div className="toolbar-divider" />

      {/* Heading buttons */}
      <div className="toolbar-group">
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editorState.isH1 ? 'is-active' : ''}
          title="Heading 1"
        >
          H1
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editorState.isH2 ? 'is-active' : ''}
          title="Heading 2"
        >
          H2
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editorState.isH3 ? 'is-active' : ''}
          title="Heading 3"
        >
          H3
        </button>
      </div>

      <div className="toolbar-divider" />

      {/* List buttons */}
      <div className="toolbar-group">
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editorState.isBulletList ? 'is-active' : ''}
          title="Bullet List"
        >
          •
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editorState.isOrderedList ? 'is-active' : ''}
          title="Ordered List"
        >
          1.
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editorState.isBlockquote ? 'is-active' : ''}
          title="Blockquote"
        >
          "
        </button>
      </div>

      <div className="toolbar-divider" />

      {/* Undo/Redo */}
      <div className="toolbar-group">
        <button onClick={() => editor.chain().focus().undo().run()} disabled={!editorState.canUndo} title="Undo">
          ↩
        </button>
        <button onClick={() => editor.chain().focus().redo().run()} disabled={!editorState.canRedo} title="Redo">
          ↪
        </button>
      </div>

      <div className="toolbar-divider" />

      {/* AI Actions Dropdown */}
      <div className="toolbar-group ai-actions-group">
        <div className="ai-dropdown">
          <button
            onClick={() => setShowAIMenu(!showAIMenu)}
            disabled={!editorState.hasSelection || isAIProcessing}
            className={`ai-trigger ${showAIMenu ? 'is-active' : ''}`}
            title="AI Actions (select text first)"
          >
            {isAIProcessing ? '⏳ AI...' : '🤖 AI Actions ▾'}
          </button>
          {showAIMenu && editorState.hasSelection && (
            <div className="ai-menu">
              {aiActions.map(({ action, label, icon }) => (
                <button
                  key={action}
                  onClick={() => {
                    onAIAction?.(action)
                    setShowAIMenu(false)
                  }}
                  className="ai-menu-item"
                >
                  <span className="ai-icon">{icon}</span>
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Spacer */}
      <div className="toolbar-spacer" />

      {/* Version info */}
      {currentVersion && (
        <div className="toolbar-version">
          <span className="version-label">v{currentVersion}</span>
          {hasUnsavedChanges && <span className="unsaved-indicator">•</span>}
        </div>
      )}

      {/* Save/Discard buttons */}
      <div className="toolbar-group version-actions">
        <button
          onClick={onDiscard}
          disabled={!hasUnsavedChanges || isSaving}
          className="discard-btn"
          title="Discard Changes"
        >
          Discard
        </button>
        <button
          onClick={onSaveVersion}
          disabled={!hasUnsavedChanges || isSaving}
          className="save-btn"
          title="Save New Version"
        >
          {isSaving ? 'Saving...' : 'Save Version'}
        </button>
      </div>
    </div>
  )
}
