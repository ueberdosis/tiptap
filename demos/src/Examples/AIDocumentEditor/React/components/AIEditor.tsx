import type { JSONContent } from '@tiptap/react'
import { EditorContent, useEditor } from '@tiptap/react'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import StarterKit from '@tiptap/starter-kit'
import { TableKit } from '@tiptap/extension-table'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

// Components
import { AIBubbleMenu } from './BubbleMenu/AIBubbleMenu.tsx'
import { ChatPanel } from './ChatPanel/ChatPanel.tsx'
import { SectionProgress } from './SectionProgress/SectionProgress.tsx'
import { Toolbar } from './Toolbar/Toolbar.tsx'
import { VersionBar } from './VersionHistory/VersionBar.tsx'

// Hooks
import { useAI } from '../hooks/useAI.ts'
import { useChat } from '../hooks/useChat.ts'
import { useVersionControl } from '../hooks/useVersionControl.ts'

// Services & Store
import { eventBus } from '../services/event-bus.ts'
import { useEditorStore } from '../stores/editor-store.ts'

// Data
import { PDBI_SUBMISSION } from '../data/pdbi-submission.ts'

// Types
import type { DocumentReference, EditorFragmentProps, Section } from '../types/index.ts'

// Use PDBI Submission as default content for demo
const DEFAULT_CONTENT: JSONContent = PDBI_SUBMISSION

const extensions = [
  StarterKit,
  Underline,
  TableKit.configure({
    resizable: true,
  }),
  Placeholder.configure({
    placeholder: 'Start writing...',
  }),
]

export function AIEditor({
  fragmentId = 'demo-fragment',
  documentType: _documentType = 'generic',
  initialContent,
  state = 'draft',
  onStateChange: _onStateChange,
  onVersionSave,
  className = '',
}: EditorFragmentProps) {
  const [error, setError] = useState<string | null>(null)
  const [currentSelection, setCurrentSelection] = useState<DocumentReference | null>(null)

  // Initialize store
  const { setFragmentId, setFragmentState } = useEditorStore()

  useEffect(() => {
    setFragmentId(fragmentId)
    setFragmentState(state)
  }, [fragmentId, state, setFragmentId, setFragmentState])

  // Initialize editor
  const editor = useEditor({
    extensions,
    content: initialContent || DEFAULT_CONTENT,
    editorProps: {
      attributes: {
        class: 'ai-editor-content',
      },
    },
    onSelectionUpdate: ({ editor: ed }) => {
      const { from, to, empty } = ed.state.selection
      if (empty) {
        setCurrentSelection(null)
      } else {
        const text = ed.state.doc.textBetween(from, to, ' ')
        setCurrentSelection({
          nodeId: `pos-${from}`,
          text,
          position: { from, to },
        })
      }
    },
  })

  // Initialize hooks
  const { isProcessing, currentAction, executeAction } = useAI({
    editor,
    onError: err => setError(err.message),
  })

  const { versions, currentVersion, hasUnsavedChanges, isSaving, saveVersion, discardChanges, restoreVersion } =
    useVersionControl({
      editor,
      fragmentId,
      onVersionSaved: onVersionSave,
    })

  const { messages, isStreaming, sendMessage, cancelStream } = useChat({
    editor,
    onError: err => setError(err.message),
  })

  // Extract sections from document
  const sections = useMemo<Section[]>(() => {
    if (!editor) return []

    const result: Section[] = []
    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === 'heading') {
        result.push({
          id: `section-${pos}`,
          title: node.textContent || 'Untitled',
          level: node.attrs.level || 1,
          position: pos,
          status: 'pending',
        })
      }
    })
    return result
  }, [editor?.state.doc])

  // Handle section click
  const handleSectionClick = useCallback(
    (section: Section) => {
      if (!editor) return
      editor.chain().focus().setTextSelection(section.position).run()
    },
    [editor],
  )

  // Handle save
  const handleSaveVersion = useCallback(async () => {
    try {
      await saveVersion()
      setError(null)
    } catch (err) {
      setError((err as Error).message)
    }
  }, [saveVersion])

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timeout = setTimeout(() => setError(null), 5000)
      return () => clearTimeout(timeout)
    }
    return undefined
  }, [error])

  // Listen for Canvas events
  useEffect(() => {
    const unsubLoad = eventBus.onCanvasEvent<{ content: JSONContent }>('fragment:load', payload => {
      if (editor && payload.content) {
        editor.commands.setContent(payload.content)
      }
    })

    const unsubCommand = eventBus.onCanvasEvent<{ instruction: string }>('ai:command', payload => {
      if (payload.instruction) {
        sendMessage(payload.instruction)
      }
    })

    return () => {
      unsubLoad()
      unsubCommand()
    }
  }, [editor, sendMessage])

  if (!editor) {
    return (
      <div className="ai-editor-loading">
        <div className="spinner" />
        <span>Loading editor...</span>
      </div>
    )
  }

  return (
    <div className={`ai-editor-container ${className}`}>
      {/* Error toast */}
      {error && (
        <div className="ai-editor-error">
          <span>{error}</span>
          <button onClick={() => setError(null)} type="button">
            ✕
          </button>
        </div>
      )}

      {/* Toolbar */}
      <Toolbar
        editor={editor}
        onSaveVersion={handleSaveVersion}
        onDiscard={discardChanges}
        hasUnsavedChanges={hasUnsavedChanges}
        isSaving={isSaving}
        currentVersion={currentVersion?.version}
        onAIAction={executeAction}
        isAIProcessing={isProcessing}
      />

      {/* Main content area */}
      <div className="ai-editor-main">
        {/* Editor area */}
        <div className="ai-editor-editor">
          {/* AI Bubble Menu */}
          <AIBubbleMenu
            editor={editor}
            onAction={executeAction}
            isProcessing={isProcessing}
            currentAction={currentAction}
          />

          {/* Editor content */}
          <EditorContent editor={editor} />

          {/* Section progress */}
          <SectionProgress
            sections={sections}
            currentSectionId={currentSelection?.nodeId}
            onSectionClick={handleSectionClick}
          />
        </div>

        {/* Chat panel */}
        <div className="ai-editor-chat">
          <ChatPanel
            messages={messages}
            isStreaming={isStreaming}
            onSendMessage={sendMessage}
            onCancelStream={cancelStream}
            currentSelection={currentSelection}
          />
        </div>
      </div>

      {/* Version history bar */}
      <VersionBar
        versions={versions}
        currentVersionId={currentVersion?.id || null}
        hasUnsavedChanges={hasUnsavedChanges}
        onSelectVersion={restoreVersion}
      />
    </div>
  )
}
