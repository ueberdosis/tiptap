import { act, cleanup, render } from '@testing-library/react'
import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import React from 'react'
import { afterEach, describe, expect, it, type MockInstance, vi } from 'vite-plus/test'

import { EditorContent } from '../../src/EditorContent.js'
import { NodeViewContent } from '../../src/NodeViewContent.js'
import { NodeViewWrapper } from '../../src/NodeViewWrapper.js'
import { ReactNodeViewRenderer } from '../../src/ReactNodeViewRenderer.js'

const { captureSpy } = vi.hoisted(() => ({ captureSpy: vi.fn() }))

vi.mock('../../src/captureDOMSelection.js', async importOriginal => {
  const original = await importOriginal<typeof import('../../src/captureDOMSelection.js')>()

  captureSpy.mockImplementation(original.captureDOMSelection)

  return { captureDOMSelection: captureSpy }
})

function ParagraphView() {
  return React.createElement(
    NodeViewWrapper,
    null,
    React.createElement(NodeViewContent, { as: 'p' }),
  )
}

const ReactParagraph = Paragraph.extend({
  addNodeView() {
    return ReactNodeViewRenderer(ParagraphView)
  },
})

const capturedTexts = () =>
  captureSpy.mock.calls.map(([element]) => (element as HTMLElement).textContent)

const findText = (root: Node, text: string) => {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)

  while (walker.nextNode()) {
    if (walker.currentNode.textContent === text) {
      return walker.currentNode
    }
  }

  throw new Error(`No text node "${text}"`)
}

// happy-dom keeps the selection when a node moves, browsers drop it
const dropSelectionOnMove = () => {
  const appendChild = Node.prototype.appendChild

  return vi.spyOn(Node.prototype, 'appendChild').mockImplementation(function (
    this: Node,
    node: Node,
  ) {
    const selection = document.getSelection()

    if (node.isConnected && selection?.anchorNode && node.contains(selection.anchorNode)) {
      selection.removeAllRanges()
    }

    return appendChild.call(this, node)
  } as typeof appendChild)
}

const flushMicrotasks = async () => {
  await act(async () => {
    await Promise.resolve()
  })
}

describe('React node view content moves', () => {
  let editor: Editor | undefined
  let appendChildSpy: MockInstance | undefined

  afterEach(() => {
    appendChildSpy?.mockRestore()
    appendChildSpy = undefined
    editor?.destroy()
    cleanup()
    captureSpy.mockClear()
  })

  it('reads the DOM selection on mount only in the node view that holds the editor selection', async () => {
    editor = new Editor({
      extensions: [Document, ReactParagraph, Text],
      content: '<p>one</p><p>two</p><p>three</p>',
    })

    render(React.createElement(EditorContent, { editor }))
    await flushMicrotasks()

    expect(capturedTexts()).toEqual(['one'])
  })

  it('keeps a selection made in a read-only editor without focus when its node is split', async () => {
    editor = new Editor({
      extensions: [Document, ReactParagraph, Text],
      content: '<p>one</p><p>two</p><p>three</p>',
      editable: false,
    })

    render(React.createElement(EditorContent, { editor }))
    await flushMicrotasks()
    captureSpy.mockClear()

    const three = findText(editor.view.dom, 'three')

    document.getSelection()!.setBaseAndExtent(three, 2, three, 4)
    await flushMicrotasks()

    const { from, to } = editor.state.selection

    expect(editor.state.doc.textBetween(from, to)).toBe('re')

    appendChildSpy = dropSelectionOnMove()

    // Split "three" into "th" and "ree"
    editor.view.dispatch(editor.state.tr.split(from))
    await flushMicrotasks()

    expect(capturedTexts()).toEqual(['ree'])
    expect(document.getSelection()!.toString()).toBe('re')
  })
})
