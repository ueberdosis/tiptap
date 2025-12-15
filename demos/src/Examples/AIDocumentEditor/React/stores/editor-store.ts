import { create } from 'zustand'
import type { AIAction, ChatMessage, DocumentType, DocumentVersion, EditorStore, FragmentState } from '../types'

export const useEditorStore = create<EditorStore>((set, get) => ({
  // Fragment state
  fragmentId: null,
  fragmentState: 'draft',
  documentType: 'generic',

  // Version control
  versions: [],
  currentVersionId: null,
  hasUnsavedChanges: false,

  // AI state
  isAIProcessing: false,
  aiAction: null,

  // Chat state
  messages: [],
  isChatStreaming: false,

  // Actions
  setFragmentId: (id: string) => set({ fragmentId: id }),

  setFragmentState: (state: FragmentState) => set({ fragmentState: state }),

  addVersion: (version: DocumentVersion) =>
    set(state => ({
      versions: [...state.versions, version],
      currentVersionId: version.id,
      hasUnsavedChanges: false,
    })),

  setCurrentVersion: (id: string) => set({ currentVersionId: id }),

  setHasUnsavedChanges: (value: boolean) => set({ hasUnsavedChanges: value }),

  setAIProcessing: (processing: boolean, action?: AIAction) =>
    set({
      isAIProcessing: processing,
      aiAction: processing ? (action ?? null) : null,
    }),

  addMessage: (message: ChatMessage) =>
    set(state => ({
      messages: [...state.messages, message],
    })),

  updateMessage: (id: string, updates: Partial<ChatMessage>) =>
    set(state => ({
      messages: state.messages.map(msg => (msg.id === id ? { ...msg, ...updates } : msg)),
    })),

  setChatStreaming: (streaming: boolean) => set({ isChatStreaming: streaming }),
}))
