import type { AIAction, AIProvider, DocumentContext } from '../types'

const AI_BACKEND_URL = import.meta.env.VITE_AI_BACKEND_URL || 'http://localhost:8000'

/**
 * Mock AI responses for different actions
 */
const MOCK_RESPONSES: Record<AIAction, (text: string) => string> = {
  improve: text => {
    const improved = text
      .replace(/\bvery\b/gi, 'exceptionally')
      .replace(/\bgood\b/gi, 'excellent')
      .replace(/\bbad\b/gi, 'suboptimal')
      .replace(/\bbig\b/gi, 'substantial')
      .replace(/\bsmall\b/gi, 'minimal')
    return improved.charAt(0).toUpperCase() + improved.slice(1) + (improved.endsWith('.') ? '' : '.')
  },
  simplify: text => {
    return text
      .replace(/utilize/gi, 'use')
      .replace(/implement/gi, 'do')
      .replace(/subsequently/gi, 'then')
      .replace(/nevertheless/gi, 'but')
      .replace(/furthermore/gi, 'also')
  },
  expand: text => {
    return `${text} This point warrants further elaboration. Specifically, we should consider the broader implications and context. Additionally, there are several related factors that merit attention in this discussion.`
  },
  summarize: text => {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim())
    if (sentences.length <= 1) return text
    return sentences[0].trim() + '.'
  },
  'fix-grammar': text => {
    return text
      .replace(/\s+/g, ' ')
      .replace(/\s+([.,!?])/g, '$1')
      .replace(/([.!?])\s*([a-z])/g, (_, p, l) => `${p} ${l.toUpperCase()}`)
      .trim()
  },
  formal: text => {
    return text
      .replace(/\bcan't\b/gi, 'cannot')
      .replace(/\bwon't\b/gi, 'will not')
      .replace(/\bdon't\b/gi, 'do not')
      .replace(/\bit's\b/gi, 'it is')
      .replace(/\bI'm\b/gi, 'I am')
      .replace(/\byou're\b/gi, 'you are')
  },
  casual: text => {
    return text
      .replace(/\bcannot\b/gi, "can't")
      .replace(/\bwill not\b/gi, "won't")
      .replace(/\bdo not\b/gi, "don't")
      .replace(/\bit is\b/gi, "it's")
      .replace(/\bI am\b/gi, "I'm")
  },
  translate: text => {
    // Mock translation - in real implementation, would call translation API
    return `[Translated] ${text}`
  },
  custom: text => text,
}

/**
 * Mock chat responses based on context
 */
function generateMockChatResponse(
  messages: Array<{ role: string; content: string }>,
  documentContext?: DocumentContext,
): string {
  const lastMessage = messages[messages.length - 1]?.content.toLowerCase() || ''

  if (documentContext?.currentSelection) {
    if (lastMessage.includes('improve') || lastMessage.includes('better')) {
      return `I can help improve the selected text: "${documentContext.currentSelection.text.slice(0, 50)}..."\n\nHere's a suggested revision that enhances clarity and impact while maintaining your original intent. Would you like me to apply this change?`
    }
    if (lastMessage.includes('explain') || lastMessage.includes('what')) {
      return `The selected passage discusses an important concept. Let me break it down:\n\n1. **Key Point**: The main idea focuses on...\n2. **Context**: This relates to the broader document theme of...\n3. **Implications**: This suggests that...\n\nWould you like me to elaborate on any of these points?`
    }
  }

  if (lastMessage.includes('help') || lastMessage.includes('how')) {
    return `I'm here to help you with your document! I can:\n\n- **Edit text**: Select text and use the AI menu to improve, simplify, or expand it\n- **Answer questions**: Ask me about your document content\n- **Make suggestions**: Request specific changes to sections\n\nWhat would you like me to help with?`
  }

  if (lastMessage.includes('section') || lastMessage.includes('outline')) {
    const sections = documentContext?.documentOutline || []
    if (sections.length > 0) {
      return `Your document has ${sections.length} sections:\n\n${sections.map((s, i) => `${i + 1}. ${s.title}`).join('\n')}\n\nWhich section would you like to work on?`
    }
    return 'I can help you structure your document into sections. What topics would you like to cover?'
  }

  return "I understand you're working on this document. How can I assist you? I can help improve specific sections, answer questions about the content, or suggest edits. Just select some text or describe what you'd like to change."
}

/**
 * Simulate streaming by yielding words with delays
 */
async function* simulateStreaming(text: string, delayMs = 30): AsyncIterable<string> {
  const words = text.split(' ')
  for (let i = 0; i < words.length; i++) {
    await new Promise(resolve => setTimeout(resolve, delayMs + Math.random() * 20))
    yield words[i] + (i < words.length - 1 ? ' ' : '')
  }
}

/**
 * Mock AI Provider for development
 */
export class MockAIProvider implements AIProvider {
  async *streamEdit(params: {
    action: AIAction
    text: string
    context?: string
    customPrompt?: string
    signal?: AbortSignal
  }): AsyncIterable<string> {
    const { action, text, customPrompt, signal } = params

    // Check for cancellation
    if (signal?.aborted) {
      return
    }

    // Generate mock response
    let response: string
    if (action === 'custom' && customPrompt) {
      response = `[Custom edit based on: "${customPrompt}"] ${text}`
    } else {
      response = MOCK_RESPONSES[action](text)
    }

    // Simulate streaming
    for await (const chunk of simulateStreaming(response)) {
      if (signal?.aborted) {
        return
      }
      yield chunk
    }
  }

  async *streamChat(params: {
    messages: Array<{ role: 'user' | 'assistant'; content: string }>
    documentContext?: DocumentContext
    signal?: AbortSignal
  }): AsyncIterable<string> {
    const { messages, documentContext, signal } = params

    if (signal?.aborted) {
      return
    }

    const response = generateMockChatResponse(messages, documentContext)

    for await (const chunk of simulateStreaming(response, 20)) {
      if (signal?.aborted) {
        return
      }
      yield chunk
    }
  }
}

/**
 * Real AI Provider that connects to FastAPI backend
 */
export class FastAPIProvider implements AIProvider {
  private baseUrl: string

  constructor(baseUrl = AI_BACKEND_URL) {
    this.baseUrl = baseUrl
  }

  async *streamEdit(params: {
    action: AIAction
    text: string
    context?: string
    customPrompt?: string
    signal?: AbortSignal
  }): AsyncIterable<string> {
    const { action, text, context, customPrompt, signal } = params

    try {
      const response = await fetch(`${this.baseUrl}/api/ai/edit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          text,
          context,
          custom_prompt: customPrompt,
        }),
        signal,
      })

      if (!response.ok) {
        throw new Error(`AI request failed: ${response.statusText}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body')
      }

      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') {
              return
            }
            yield data
          }
        }
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        return
      }
      throw error
    }
  }

  async *streamChat(params: {
    messages: Array<{ role: 'user' | 'assistant'; content: string }>
    documentContext?: DocumentContext
    signal?: AbortSignal
  }): AsyncIterable<string> {
    const { messages, documentContext, signal } = params

    try {
      const response = await fetch(`${this.baseUrl}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          document_context: documentContext,
        }),
        signal,
      })

      if (!response.ok) {
        throw new Error(`Chat request failed: ${response.statusText}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body')
      }

      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') {
              return
            }
            yield data
          }
        }
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        return
      }
      throw error
    }
  }
}

/**
 * Create the appropriate AI provider based on environment
 */
export function createAIProvider(): AIProvider {
  // For development, use mock provider
  // In production, this would check for API availability
  const useMock = import.meta.env.VITE_USE_MOCK_AI !== 'false'

  if (useMock) {
    console.log('[AI Provider] Using mock provider')
    return new MockAIProvider()
  }

  console.log(`[AI Provider] Using FastAPI at ${AI_BACKEND_URL}`)
  return new FastAPIProvider()
}

// Singleton instance
let providerInstance: AIProvider | null = null

export function getAIProvider(): AIProvider {
  if (!providerInstance) {
    providerInstance = createAIProvider()
  }
  return providerInstance
}
