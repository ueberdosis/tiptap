import type { Editor, JSONContent } from '@tiptap/react'

// Fragment state from ScyAI
export type FragmentState = 'draft' | 'in_review' | 'approved' | 'submitted'

export type DocumentType = 'pdbi_submission' | 'loss_summary' | 'engineering_report' | 'generic'

// Version control
export interface DocumentVersion {
  id: string
  version: string // "0", "0.1", "0.2", "1.0"
  content: JSONContent
  createdAt: Date
  createdBy: 'user' | 'ai'
  label?: string
  parentId: string | null
  metadata: {
    wordCount: number
    sectionState: Record<string, SectionStatus>
  }
}

export type SectionStatus = 'pending' | 'in_progress' | 'complete' | 'in_review'

export interface Section {
  id: string
  title: string
  level: number
  position: number
  status: SectionStatus
}

// AI actions
export type AIAction =
  | 'improve'
  | 'simplify'
  | 'expand'
  | 'summarize'
  | 'fix-grammar'
  | 'formal'
  | 'casual'
  | 'translate'
  | 'custom'

export interface AIActionConfig {
  action: AIAction
  label: string
  description: string
  icon?: string
}

// Chat types
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  documentReference?: DocumentReference
  suggestedEdit?: SuggestedEdit
  isStreaming?: boolean
}

export interface DocumentReference {
  nodeId: string
  text: string
  position: { from: number; to: number }
}

export interface SuggestedEdit {
  original: string
  replacement: string
  targetNodeId?: string
  applied?: boolean
}

export interface DocumentContext {
  currentSelection: {
    text: string
    nodeId: string
    position: { from: number; to: number }
  } | null
  documentOutline: Section[]
  currentSection?: Section
  fullText?: string
}

// Event bus types
export type EditorEventType =
  | 'version:saved'
  | 'version:restored'
  | 'ai:edit:start'
  | 'ai:edit:complete'
  | 'ai:edit:error'
  | 'state:changed'
  | 'fragment:load'
  | 'ai:command'

export interface EditorEvent<T = unknown> {
  type: EditorEventType
  payload: T
}

export interface VersionSavedPayload {
  fragmentId: string
  version: DocumentVersion
}

export interface AIEditPayload {
  fragmentId: string
  action: AIAction
  selection?: DocumentReference
}

export interface FragmentLoadPayload {
  fragmentId: string
  content: JSONContent
  state: FragmentState
}

// Props for the editor fragment
export interface EditorFragmentProps {
  fragmentId: string
  documentType: DocumentType
  initialContent?: JSONContent
  blueprintId?: string
  state?: FragmentState
  sectionState?: Record<string, SectionStatus>
  onStateChange?: (state: FragmentState) => void
  onVersionSave?: (version: DocumentVersion) => void
  className?: string
}

// AI Provider interface
export interface AIProvider {
  streamEdit(params: {
    action: AIAction
    text: string
    context?: string
    customPrompt?: string
    signal?: AbortSignal
  }): AsyncIterable<string>

  streamChat(params: {
    messages: Array<{ role: 'user' | 'assistant'; content: string }>
    documentContext?: DocumentContext
    signal?: AbortSignal
  }): AsyncIterable<string>
}

// Toolbar props
export interface ToolbarProps {
  editor: Editor
  onSaveVersion: () => void
  onDiscard: () => void
  hasUnsavedChanges: boolean
  isSaving: boolean
  currentVersion?: string
}

// Store state
export interface EditorStore {
  // Fragment state
  fragmentId: string | null
  fragmentState: FragmentState
  documentType: DocumentType

  // Version control
  versions: DocumentVersion[]
  currentVersionId: string | null
  hasUnsavedChanges: boolean

  // AI state
  isAIProcessing: boolean
  aiAction: AIAction | null

  // Chat state
  messages: ChatMessage[]
  isChatStreaming: boolean

  // Actions
  setFragmentId: (id: string) => void
  setFragmentState: (state: FragmentState) => void
  addVersion: (version: DocumentVersion) => void
  setCurrentVersion: (id: string) => void
  setHasUnsavedChanges: (value: boolean) => void
  setAIProcessing: (processing: boolean, action?: AIAction) => void
  addMessage: (message: ChatMessage) => void
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void
  setChatStreaming: (streaming: boolean) => void
}
