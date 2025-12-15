import type { Editor } from '@tiptap/react'
import { useCallback, useRef, useState } from 'react'

import { getAIProvider } from '../services/ai-provider.ts'
import { useEditorStore } from '../stores/editor-store.ts'
import type { ChatMessage, DocumentContext, Section } from '../types/index.ts'

// Simple ID generator
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

interface UseChatOptions {
  editor: Editor | null
  onError?: (error: Error) => void
}

interface UseChatReturn {
  messages: ChatMessage[]
  isStreaming: boolean
  sendMessage: (content: string) => Promise<void>
  cancelStream: () => void
  clearMessages: () => void
  applyEdit: (messageId: string) => void
}

/**
 * Get document context for chat
 */
function getDocumentContext(editor: Editor): DocumentContext {
  const { selection, doc } = editor.state
  const { from, to, empty } = selection

  // Current selection
  const currentSelection = empty
    ? null
    : {
        text: doc.textBetween(from, to, ' '),
        nodeId: `pos-${from}`,
        position: { from, to },
      }

  // Document outline
  const documentOutline: Section[] = []
  doc.descendants((node, pos) => {
    if (node.type.name === 'heading') {
      documentOutline.push({
        id: `heading-${pos}`,
        title: node.textContent,
        level: node.attrs.level || 1,
        position: pos,
        status: 'pending',
      })
    }
  })

  // Current section
  let currentSection: Section | undefined
  for (let i = documentOutline.length - 1; i >= 0; i--) {
    if (documentOutline[i].position <= from) {
      currentSection = documentOutline[i]
      break
    }
  }

  return {
    currentSelection,
    documentOutline,
    currentSection,
  }
}

export function useChat({ editor, onError }: UseChatOptions): UseChatReturn {
  const abortControllerRef = useRef<AbortController | null>(null)

  const { messages, isChatStreaming, addMessage, updateMessage, setChatStreaming } = useEditorStore()

  const sendMessage = useCallback(
    async (content: string) => {
      if (!editor || isChatStreaming) return

      // Get document context
      const documentContext = getDocumentContext(editor)

      // Add user message
      const userMessage: ChatMessage = {
        id: generateId(),
        role: 'user',
        content,
        timestamp: new Date(),
        documentReference: documentContext.currentSelection || undefined,
      }
      addMessage(userMessage)

      // Create placeholder for assistant message
      const assistantMessageId = generateId()
      const assistantMessage: ChatMessage = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isStreaming: true,
      }
      addMessage(assistantMessage)

      // Start streaming
      abortControllerRef.current = new AbortController()
      const { signal } = abortControllerRef.current
      setChatStreaming(true)

      try {
        const provider = getAIProvider()
        let fullResponse = ''

        // Prepare messages for API
        const apiMessages = messages
          .filter(m => !m.isStreaming)
          .concat(userMessage)
          .map(m => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          }))

        for await (const chunk of provider.streamChat({
          messages: apiMessages,
          documentContext,
          signal,
        })) {
          if (signal.aborted) break

          fullResponse += chunk
          updateMessage(assistantMessageId, {
            content: fullResponse,
          })
        }

        // Finalize message
        updateMessage(assistantMessageId, {
          content: fullResponse,
          isStreaming: false,
        })
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Chat error:', error)
          onError?.(error as Error)
          updateMessage(assistantMessageId, {
            content: 'Sorry, an error occurred. Please try again.',
            isStreaming: false,
          })
        }
      } finally {
        setChatStreaming(false)
        abortControllerRef.current = null
      }
    },
    [editor, messages, isChatStreaming, addMessage, updateMessage, setChatStreaming, onError],
  )

  const cancelStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }, [])

  const clearMessages = useCallback(() => {
    // This would need a clear action in the store
    // For now, we'll just not implement it
  }, [])

  const applyEdit = useCallback(
    (messageId: string) => {
      if (!editor) return

      const message = messages.find(m => m.id === messageId)
      if (!message?.suggestedEdit) return

      const { original, replacement, targetNodeId } = message.suggestedEdit

      // Simple replacement - in real implementation would use position mapping
      const { doc } = editor.state
      let found = false

      doc.descendants((node, pos) => {
        if (found) return false
        if (node.isText && node.text?.includes(original)) {
          const from = pos + node.text.indexOf(original)
          const to = from + original.length
          editor.chain().focus().deleteRange({ from, to }).insertContentAt(from, replacement).run()
          found = true
          return false
        }
      })

      if (found) {
        updateMessage(messageId, {
          suggestedEdit: { ...message.suggestedEdit, applied: true },
        })
      }
    },
    [editor, messages, updateMessage],
  )

  return {
    messages,
    isStreaming: isChatStreaming,
    sendMessage,
    cancelStream,
    clearMessages,
    applyEdit,
  }
}
