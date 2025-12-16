import './styles.scss'

import React from 'react'

import { AIEditor } from './components/AIEditor.tsx'
import { PDBI_FRAGMENT_METADATA } from './data/pdbi-submission.ts'

/**
 * AI Document Editor Demo - PDBI Submission
 *
 * This demo shows how ScyAI generates and loads a Property Damage &
 * Business Interruption (PDBI) insurance submission document.
 *
 * The document is represented as ProseMirror JSON, which ScyAI generates
 * directly from its reasoning engine based on source documents.
 *
 * Flow:
 * 1. ScyAI processes source documents (PDFs, Excel SOVs, prior policies)
 * 2. ScyAI generates ProseMirror JSON document with proper structure
 * 3. Frontend loads JSON into Tiptap editor for user review/editing
 * 4. User can use AI actions to improve specific sections
 * 5. Versions are saved to IndexedDB for persistence
 */
export default function AIDocumentEditorDemo() {
  // In production, this would come from ScyAI's reasoning engine
  const fragmentProps = {
    fragmentId: PDBI_FRAGMENT_METADATA.fragmentId,
    documentType: PDBI_FRAGMENT_METADATA.documentType,
    state: PDBI_FRAGMENT_METADATA.state,
    // initialContent is loaded from PDBI_SUBMISSION in AIEditor
  }

  return (
    <div className="ai-document-editor-demo">
      <AIEditor {...fragmentProps} />
    </div>
  )
}
