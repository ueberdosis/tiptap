import type { Editor } from '@tiptap/react'
import { useCallback, useRef, useState } from 'react'

import { getAIProvider } from '../services/ai-provider.ts'
import { eventBus } from '../services/event-bus.ts'
import { useEditorStore } from '../stores/editor-store.ts'
import type { AIAction, DocumentContext, Section } from '../types/index.ts'

interface UseAIOptions {
  editor: Editor | null
  onError?: (error: Error) => void
}

interface UseAIReturn {
  isProcessing: boolean
  currentAction: AIAction | null
  executeAction: (action: AIAction, customPrompt?: string) => Promise<void>
  cancelAction: () => void
}

/**
 * Extract document context for AI operations
 */
function getDocumentContext(editor: Editor): DocumentContext {
  const { selection, doc } = editor.state
  const { from, to, empty } = selection

  // Extract current selection
  const currentSelection = empty
    ? null
    : {
        text: doc.textBetween(from, to, ' '),
        nodeId: '', // Would need unique-id extension
        position: { from, to },
      }

  // Extract document outline (headings)
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

  // Find current section
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

export function useAI({ editor, onError }: UseAIOptions): UseAIReturn {
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentAction, setCurrentAction] = useState<AIAction | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const { fragmentId, setAIProcessing, setHasUnsavedChanges } = useEditorStore()

  const executeAction = useCallback(
    async (action: AIAction, customPrompt?: string) => {
      if (!editor || isProcessing) return

      const { selection, doc } = editor.state
      const { from, to, empty } = selection

      if (empty) {
        onError?.(new Error('Please select some text first'))
        return
      }

      const selectedText = doc.textBetween(from, to, ' ')
      if (!selectedText.trim()) {
        onError?.(new Error('Selected text is empty'))
        return
      }

      // Create abort controller for this operation
      abortControllerRef.current = new AbortController()
      const { signal } = abortControllerRef.current

      setIsProcessing(true)
      setCurrentAction(action)
      setAIProcessing(true, action)

      // Emit event
      eventBus.emit('ai:edit:start', {
        fragmentId,
        action,
        selection: { text: selectedText, position: { from, to } },
      })

      try {
        const provider = getAIProvider()
        const context = getDocumentContext(editor)

        // Store the original selection range
        const originalFrom = from
        const originalTo = to

        // Delete the selected content first
        editor.chain().focus().deleteRange({ from: originalFrom, to: originalTo }).run()

        // Track where we're inserting
        let insertPos = originalFrom
        let insertedText = ''

        // Stream the AI response
        for await (const chunk of provider.streamEdit({
          action,
          text: selectedText,
          context: context.currentSection?.title,
          customPrompt,
          signal,
        })) {
          if (signal.aborted) {
            // Rollback: delete what we inserted and restore original
            if (insertedText) {
              editor
                .chain()
                .focus()
                .deleteRange({ from: originalFrom, to: originalFrom + insertedText.length })
                .insertContentAt(originalFrom, selectedText)
                .run()
            }
            break
          }

          // Insert the chunk at current position
          editor.chain().insertContentAt(insertPos, chunk).run()
          insertedText += chunk
          insertPos += chunk.length
        }

        if (!signal.aborted) {
          setHasUnsavedChanges(true)

          // Emit completion event
          eventBus.emit('ai:edit:complete', {
            fragmentId,
            action,
            original: selectedText,
            result: insertedText,
          })
        }
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('AI action failed:', error)
          onError?.(error as Error)

          eventBus.emit('ai:edit:error', {
            fragmentId,
            action,
            error: (error as Error).message,
          })
        }
      } finally {
        setIsProcessing(false)
        setCurrentAction(null)
        setAIProcessing(false)
        abortControllerRef.current = null
      }
    },
    [editor, isProcessing, fragmentId, onError, setAIProcessing, setHasUnsavedChanges],
  )

  const cancelAction = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }, [])

  return {
    isProcessing,
    currentAction,
    executeAction,
    cancelAction,
  }
}
