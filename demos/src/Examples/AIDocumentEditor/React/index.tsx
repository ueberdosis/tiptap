import './styles.scss'

import React from 'react'

import { AIEditor } from './components/AIEditor'

/**
 * AI Document Editor Demo
 *
 * This is a production-ready editor fragment for ScyAI that integrates:
 * - Tiptap editor with rich text formatting
 * - AI-powered text editing (improve, simplify, expand, etc.)
 * - Chat panel for document Q&A
 * - Version control with IndexedDB persistence
 * - Section progress tracking
 * - Event bus for ScyAI Canvas integration
 */
export default function AIDocumentEditorDemo() {
  const demoProps = {
    fragmentId: 'demo-fragment-001',
    documentType: 'generic' as const,
    state: 'draft' as const,
  }

  return (
    <div className="ai-document-editor-demo">
      <AIEditor {...demoProps} />
    </div>
  )
}
