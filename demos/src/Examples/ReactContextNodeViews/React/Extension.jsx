import { mergeAttributes, Node } from '@tiptap/core'
import { NodeViewContent, NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react'
import React, { useContext } from 'react'

import { CounterContext, ThemeContext } from './contexts.js'

// Container NodeView - Provides visual grouping and demonstrates nested content
const ContainerComponent = () => {
  const { theme, primaryColor } = useContext(ThemeContext)
  const { count } = useContext(CounterContext)

  return (
    <NodeViewWrapper
      className={`container-node theme-${theme}`}
      style={{
        borderColor: primaryColor,
        backgroundColor: theme === 'dark' ? '#1f2937' : '#f9fafb',
      }}
    >
      <div className="container-header">
        <span className="container-title">📦 Container (using Context)</span>
        <span className="container-badge" style={{ backgroundColor: primaryColor }}>
          Count: {count}
        </span>
      </div>
      <div className="container-content">
        <NodeViewContent />
      </div>
    </NodeViewWrapper>
  )
}

// Themed Card NodeView - Nested inside Container, also uses Context
const ThemedCardComponent = ({ node }) => {
  const { theme, primaryColor } = useContext(ThemeContext)
  const { count, increment, decrement } = useContext(CounterContext)

  const title = node.attrs.title || 'Untitled Card'

  return (
    <NodeViewWrapper
      className={`themed-card theme-${theme}`}
      data-theme={theme}
      style={{
        borderLeftColor: primaryColor,
        backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
        color: theme === 'dark' ? '#f3f4f6' : '#111827',
      }}
    >
      <div className="card-header" style={{ color: primaryColor }}>
        <h3>{title}</h3>
        <div className="card-counter">
          <button onClick={decrement} className="counter-btn" style={{ color: primaryColor }}>
            -
          </button>
          <span className="counter-value">{count}</span>
          <button onClick={increment} className="counter-btn" style={{ color: primaryColor }}>
            +
          </button>
        </div>
      </div>
      <div className="card-body">
        <NodeViewContent />
      </div>
      <div className="card-footer">
        <span className="card-badge" style={{ backgroundColor: primaryColor }}>
          {theme} theme
        </span>
      </div>
    </NodeViewWrapper>
  )
}

// Container Extension
export const ContainerNode = Node.create({
  name: 'container',
  group: 'block',
  content: 'block+',

  parseHTML() {
    return [
      {
        tag: 'container',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['container', mergeAttributes(HTMLAttributes), 0]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ContainerComponent)
  },
})

// Themed Card Extension
export const ThemedCard = Node.create({
  name: 'themed-card',
  group: 'block',
  content: 'inline*',

  addAttributes() {
    return {
      title: {
        default: 'Card',
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'themed-card',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['themed-card', mergeAttributes(HTMLAttributes), 0]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ThemedCardComponent)
  },
})
