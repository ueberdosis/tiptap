import React, { useEffect, useRef, useState } from 'react'

import type { ChatMessage, DocumentReference } from '../../types/index.ts'

interface ChatPanelProps {
  messages: ChatMessage[]
  isStreaming: boolean
  onSendMessage: (content: string) => void
  onCancelStream: () => void
  currentSelection?: DocumentReference | null
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'

  return (
    <div className={`chat-message ${isUser ? 'user' : 'assistant'}`}>
      <div className="message-header">
        <span className="message-role">{isUser ? 'You' : 'ScyAI'}</span>
        <span className="message-time">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {message.documentReference && (
        <div className="message-reference">
          <span className="reference-label">Referenced:</span>
          <span className="reference-text">"{message.documentReference.text.slice(0, 100)}..."</span>
        </div>
      )}

      <div className="message-content">
        {message.content}
        {message.isStreaming && <span className="cursor-blink">▊</span>}
      </div>

      {message.suggestedEdit && !message.suggestedEdit.applied && (
        <div className="message-edit-suggestion">
          <div className="edit-diff">
            <div className="diff-remove">- {message.suggestedEdit.original}</div>
            <div className="diff-add">+ {message.suggestedEdit.replacement}</div>
          </div>
          <button className="apply-edit-btn">Apply Edit</button>
        </div>
      )}
    </div>
  )
}

export function ChatPanel({ messages, isStreaming, onSendMessage, onCancelStream, currentSelection }: ChatPanelProps) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isStreaming) {
      onSendMessage(input.trim())
      setInput('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <h3>ScyAI Assistant</h3>
        {isStreaming && (
          <button onClick={onCancelStream} className="cancel-btn" title="Cancel">
            ✕ Stop
          </button>
        )}
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-empty">
            <div className="empty-icon">💬</div>
            <p>Ask me anything about your document!</p>
            <div className="suggestions">
              <button onClick={() => onSendMessage('Help me improve this document')}>
                Help me improve this document
              </button>
              <button onClick={() => onSendMessage('Summarize the main points')}>Summarize the main points</button>
              <button onClick={() => onSendMessage('What sections need work?')}>What sections need work?</button>
            </div>
          </div>
        ) : (
          messages.map(message => <MessageBubble key={message.id} message={message} />)
        )}
        <div ref={messagesEndRef} />
      </div>

      {currentSelection && (
        <div className="chat-selection-context">
          <span className="context-label">Selected:</span>
          <span className="context-text">"{currentSelection.text.slice(0, 50)}..."</span>
        </div>
      )}

      <form className="chat-input-form" onSubmit={handleSubmit}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={currentSelection ? 'Ask about the selected text...' : 'Ask ScyAI about your document...'}
          disabled={isStreaming}
          rows={1}
        />
        <button type="submit" disabled={!input.trim() || isStreaming}>
          {isStreaming ? '...' : '➤'}
        </button>
      </form>
    </div>
  )
}
