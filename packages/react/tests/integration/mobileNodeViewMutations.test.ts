import { act, cleanup, render } from '@testing-library/react'
import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import HardBreak from '@tiptap/extension-hard-break'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { Plugin } from '@tiptap/pm/state'
import React from 'react'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'

import { EditorContent } from '../../src/EditorContent.js'
import { NodeViewContent } from '../../src/NodeViewContent.js'
import { NodeViewWrapper } from '../../src/NodeViewWrapper.js'
import { ReactNodeViewRenderer } from '../../src/ReactNodeViewRenderer.js'

function ParagraphView() {
  return React.createElement(
    NodeViewWrapper,
    null,
    React.createElement(NodeViewContent, { as: 'p' }),
  )
}

describe('React node view portal mutations after Enter', () => {
  let editor: Editor | undefined

  afterEach(() => {
    editor?.destroy()
    cleanup()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it.each([
    ['iOS', 'iPhone', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)'],
    ['Android', 'Linux armv8l', 'Mozilla/5.0 (Linux; Android 14) Chrome/140.0.0.0'],
    ['desktop', 'Linux x86_64', 'Mozilla/5.0 (X11; Linux x86_64) Chrome/140.0.0.0'],
  ])('ignores portal mounting and contentDOM moves on %s', async (device, platform, userAgent) => {
    vi.stubGlobal('navigator', { platform, userAgent })

    const mutations: Array<{ mutation: MutationRecord; ignored: boolean }> = []
    const ReactParagraph = Paragraph.extend({
      addNodeView() {
        const renderer = ReactNodeViewRenderer(ParagraphView)

        return props => {
          const nodeView = renderer(props)
          const ignoreMutation = nodeView.ignoreMutation?.bind(nodeView)

          nodeView.ignoreMutation = mutation => {
            const ignored = ignoreMutation?.(mutation) ?? false

            if (mutation.type === 'childList' && !nodeView.contentDOM?.contains(mutation.target)) {
              mutations.push({ mutation, ignored })

              // Bound the regression so a redraw loop cannot hang the test runner.
              return true
            }

            return ignored
          }

          return nodeView
        }
      },
    })

    editor = new Editor({
      extensions: [Document, ReactParagraph, Text, HardBreak],
      content: '<p>Hello</p>',
    })
    const currentEditor = editor

    await act(async () => {
      render(React.createElement(EditorContent, { editor: currentEditor }))
    })

    const nextBeforeInput = vi.fn(() => false)

    currentEditor.registerPlugin(
      new Plugin({
        props: { handleDOMEvents: { beforeinput: nextBeforeInput } },
      }),
    )
    mutations.length = 0

    await act(async () => {
      currentEditor.commands.setTextSelection(6)
      currentEditor.view.focus()

      if (device === 'desktop') {
        expect(currentEditor.commands.keyboardShortcut('Enter')).toBe(true)
        return
      }

      const event = new InputEvent('beforeinput', {
        inputType: 'insertParagraph',
        bubbles: true,
        cancelable: true,
      })

      currentEditor.view.dom.dispatchEvent(event)
      expect(event.defaultPrevented).toBe(true)
      expect(nextBeforeInput).not.toHaveBeenCalled()
    })
    await new Promise(resolve => setTimeout(resolve, 20))

    const contentMoves = mutations.filter(({ mutation }) =>
      [...mutation.addedNodes, ...mutation.removedNodes].some(
        node => node instanceof HTMLElement && node.hasAttribute('data-node-view-content-react'),
      ),
    )

    expect(contentMoves.some(({ mutation }) => mutation.addedNodes.length > 0)).toBe(true)
    expect(contentMoves.some(({ mutation }) => mutation.removedNodes.length > 0)).toBe(true)
    expect(mutations.every(({ ignored }) => ignored)).toBe(true)
    expect(currentEditor.getJSON().content).toEqual([
      { type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] },
      { type: 'paragraph' },
    ])
    expect(currentEditor.state.selection.from).toBe(8)

    if (device === 'desktop') {
      return
    }

    await act(async () => {
      const event = new InputEvent('beforeinput', {
        inputType: 'insertLineBreak',
        bubbles: true,
        cancelable: true,
      })

      currentEditor.view.dom.dispatchEvent(event)
      expect(event.defaultPrevented).toBe(true)
      expect(nextBeforeInput).not.toHaveBeenCalled()
    })

    expect(currentEditor.getJSON().content).toEqual([
      { type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] },
      { type: 'paragraph', content: [{ type: 'hardBreak' }] },
    ])
    expect(currentEditor.state.selection.from).toBe(9)
  })
})
