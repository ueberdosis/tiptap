import { render, screen, waitFor } from '@testing-library/react'
import { Editor , mergeAttributes,Node } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import React, { createContext, useContext } from 'react'
import { afterEach, describe, expect, it } from 'vitest'

import { EditorContent } from '../src/EditorContent.js'
import { NodeViewContent } from '../src/NodeViewContent.js'
import { NodeViewWrapper } from '../src/NodeViewWrapper.js'
import { ReactNodeViewRenderer } from '../src/ReactNodeViewRenderer.js'
import type { NodeViewProps } from '../src/types'

/**
 * Test suite for React Context propagation in nested NodeViews.
 *
 * This test validates that React Context correctly propagates from parent NodeViews
 * to nested child NodeViews, enabling the use of UI libraries that rely on context
 * for theming, state management, and other cross-component communication.
 */
describe('React Context in nested NodeViews', () => {
  let editor: Editor | null = null

  afterEach(() => {
    if (editor && !editor.isDestroyed) {
      editor.destroy()
    }
    editor = null
  })

  it('should propagate context from parent NodeView to nested child NodeView', async () => {
    // Create a test context
    const TestContext = createContext<string | null>(null)

    // Parent component that provides context
    const ParentNodeView: React.FC<NodeViewProps> = () => {
      return (
        <NodeViewWrapper data-testid="parent-node">
          <TestContext.Provider value="context-value-from-parent">
            <div>Parent Node</div>
            <NodeViewContent />
          </TestContext.Provider>
        </NodeViewWrapper>
      )
    }

    // Child component that consumes context
    const ChildNodeView: React.FC<NodeViewProps> = () => {
      const contextValue = useContext(TestContext)

      return (
        <NodeViewWrapper data-testid="child-node">
          <div data-testid="context-consumer">{contextValue || 'no-context-found'}</div>
        </NodeViewWrapper>
      )
    }

    // Define parent extension
    const ParentExtension = Node.create({
      name: 'parentNode',
      group: 'block',
      content: 'block+',

      parseHTML() {
        return [{ tag: 'div[data-type="parent"]' }]
      },

      renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'parent' }), 0]
      },

      addNodeView() {
        return ReactNodeViewRenderer(ParentNodeView)
      },
    })

    // Define child extension
    const ChildExtension = Node.create({
      name: 'childNode',
      group: 'block',
      content: 'inline*',

      parseHTML() {
        return [{ tag: 'div[data-type="child"]' }]
      },

      renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'child' }), 0]
      },

      addNodeView() {
        return ReactNodeViewRenderer(ChildNodeView)
      },
    })

    // Create editor with nested node structure
    editor = new Editor({
      extensions: [Document, Paragraph, Text, ParentExtension, ChildExtension],
      content: {
        type: 'doc',
        content: [
          {
            type: 'parentNode',
            content: [
              {
                type: 'childNode',
                content: [],
              },
            ],
          },
        ],
      },
    })

    // Render the editor
    render(<EditorContent editor={editor} />)

    // Wait for both nodes to render
    await waitFor(() => {
      expect(screen.getByTestId('parent-node')).toBeInTheDocument()
      expect(screen.getByTestId('child-node')).toBeInTheDocument()
    })

    // Assert that the child NodeView received the context from the parent
    const contextConsumer = screen.getByTestId('context-consumer')
    expect(contextConsumer.textContent).toBe('context-value-from-parent')
  })

  it('should maintain context through multiple nesting levels', async () => {
    // Create nested contexts
    const LevelOneContext = createContext<string>('default-1')
    const LevelTwoContext = createContext<string>('default-2')

    // Level 1 NodeView - provides first context
    const LevelOneNode: React.FC<NodeViewProps> = () => {
      return (
        <NodeViewWrapper data-testid="level-one">
          <LevelOneContext.Provider value="level-1-value">
            <div>Level 1</div>
            <NodeViewContent />
          </LevelOneContext.Provider>
        </NodeViewWrapper>
      )
    }

    // Level 2 NodeView - provides second context, can read first
    const LevelTwoNode: React.FC<NodeViewProps> = () => {
      const level1Value = useContext(LevelOneContext)

      return (
        <NodeViewWrapper data-testid="level-two">
          <LevelTwoContext.Provider value="level-2-value">
            <div data-testid="level-two-reads-one">{level1Value}</div>
            <NodeViewContent />
          </LevelTwoContext.Provider>
        </NodeViewWrapper>
      )
    }

    // Level 3 NodeView - reads both contexts
    const LevelThreeNode: React.FC<NodeViewProps> = () => {
      const level1Value = useContext(LevelOneContext)
      const level2Value = useContext(LevelTwoContext)

      return (
        <NodeViewWrapper data-testid="level-three">
          <div data-testid="level-three-reads-one">{level1Value}</div>
          <div data-testid="level-three-reads-two">{level2Value}</div>
        </NodeViewWrapper>
      )
    }

    const Level1Extension = Node.create({
      name: 'level1Node',
      group: 'block',
      content: 'block+',
      parseHTML() {
        return [{ tag: 'div[data-level="1"]' }]
      },
      renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, { 'data-level': '1' }), 0]
      },
      addNodeView() {
        return ReactNodeViewRenderer(LevelOneNode)
      },
    })

    const Level2Extension = Node.create({
      name: 'level2Node',
      group: 'block',
      content: 'block+',
      parseHTML() {
        return [{ tag: 'div[data-level="2"]' }]
      },
      renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, { 'data-level': '2' }), 0]
      },
      addNodeView() {
        return ReactNodeViewRenderer(LevelTwoNode)
      },
    })

    const Level3Extension = Node.create({
      name: 'level3Node',
      group: 'block',
      content: 'inline*',
      parseHTML() {
        return [{ tag: 'div[data-level="3"]' }]
      },
      renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, { 'data-level': '3' }), 0]
      },
      addNodeView() {
        return ReactNodeViewRenderer(LevelThreeNode)
      },
    })

    editor = new Editor({
      extensions: [Document, Paragraph, Text, Level1Extension, Level2Extension, Level3Extension],
      content: {
        type: 'doc',
        content: [
          {
            type: 'level1Node',
            content: [
              {
                type: 'level2Node',
                content: [
                  {
                    type: 'level3Node',
                    content: [],
                  },
                ],
              },
            ],
          },
        ],
      },
    })

    render(<EditorContent editor={editor} />)

    await waitFor(() => {
      expect(screen.getByTestId('level-one')).toBeInTheDocument()
      expect(screen.getByTestId('level-two')).toBeInTheDocument()
      expect(screen.getByTestId('level-three')).toBeInTheDocument()
    })

    // Level 2 should read Level 1 context
    expect(screen.getByTestId('level-two-reads-one').textContent).toBe('level-1-value')

    // Level 3 should read both contexts
    expect(screen.getByTestId('level-three-reads-one').textContent).toBe('level-1-value')
    expect(screen.getByTestId('level-three-reads-two').textContent).toBe('level-2-value')
  })

  it('should isolate context between sibling NodeViews', async () => {
    const TestContext = createContext<string>('default')

    const ProviderNode: React.FC<NodeViewProps> = () => {
      return (
        <NodeViewWrapper data-testid="provider-node">
          <TestContext.Provider value="sibling-a-value">
            <div>Provider A</div>
            <NodeViewContent />
          </TestContext.Provider>
        </NodeViewWrapper>
      )
    }

    const ConsumerNode: React.FC<NodeViewProps> = () => {
      const contextValue = useContext(TestContext)

      return (
        <NodeViewWrapper data-testid="consumer-node">
          <div data-testid="sibling-consumer">{contextValue}</div>
        </NodeViewWrapper>
      )
    }

    const ProviderExtension = Node.create({
      name: 'providerNode',
      group: 'block',
      content: 'block*',
      parseHTML() {
        return [{ tag: 'div[data-type="provider"]' }]
      },
      renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'provider' }), 0]
      },
      addNodeView() {
        return ReactNodeViewRenderer(ProviderNode)
      },
    })

    const ConsumerExtension = Node.create({
      name: 'consumerNode',
      group: 'block',
      content: 'inline*',
      parseHTML() {
        return [{ tag: 'div[data-type="consumer"]' }]
      },
      renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'consumer' }), 0]
      },
      addNodeView() {
        return ReactNodeViewRenderer(ConsumerNode)
      },
    })

    // Create structure where consumer is a SIBLING, not a child
    editor = new Editor({
      extensions: [Document, Paragraph, Text, ProviderExtension, ConsumerExtension],
      content: {
        type: 'doc',
        content: [
          {
            type: 'providerNode',
            content: [],
          },
          {
            type: 'consumerNode',
            content: [],
          },
        ],
      },
    })

    render(<EditorContent editor={editor} />)

    await waitFor(() => {
      expect(screen.getByTestId('provider-node')).toBeInTheDocument()
      expect(screen.getByTestId('consumer-node')).toBeInTheDocument()
    })

    // Sibling should NOT have access to the provider's context
    const siblingConsumer = screen.getByTestId('sibling-consumer')
    expect(siblingConsumer.textContent).toBe('default')
  })
})
