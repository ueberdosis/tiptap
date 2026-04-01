import { Editor, Node, ResizableNodeView } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { afterEach, describe, expect, it } from 'vitest'

const InlineImage = Node.create({
  name: 'inlineImage',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return {
      src: { default: null },
      width: { default: null },
      height: { default: null },
    }
  },

  parseHTML() {
    return [{ tag: 'img[data-type="inline"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['img', { 'data-type': 'inline', ...HTMLAttributes }]
  },

  addNodeView() {
    return ({ node, editor, getPos }) => {
      const el = document.createElement('img')

      return new ResizableNodeView({
        element: el,
        node,
        editor,
        getPos: getPos as () => number,
        onResize: () => {},
        onCommit: () => {},
        onUpdate: () => true,
      })
    }
  },
})

const BlockImage = Node.create({
  name: 'blockImage',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      src: { default: null },
      width: { default: null },
      height: { default: null },
    }
  },

  parseHTML() {
    return [{ tag: 'img[data-type="block"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['img', { 'data-type': 'block', ...HTMLAttributes }]
  },

  addNodeView() {
    return ({ node, editor, getPos }) => {
      const el = document.createElement('img')

      return new ResizableNodeView({
        element: el,
        node,
        editor,
        getPos: getPos as () => number,
        onResize: () => {},
        onCommit: () => {},
        onUpdate: () => true,
      })
    }
  },
})

describe('ResizableNodeView', () => {
  let editor: Editor

  afterEach(() => {
    editor?.destroy()
  })

  it('should use inline-flex display for inline nodes', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, InlineImage],
      content: '<p><img data-type="inline" src="test.png" /></p>',
    })

    const container = editor.view.dom.querySelector('[data-resize-container][data-node="inlineImage"]') as HTMLElement

    expect(container).not.toBeNull()
    expect(container.style.display).toBe('inline-flex')
  })

  it('should use flex display for block nodes', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, BlockImage],
      content: '<img data-type="block" src="test.png" />',
    })

    const container = editor.view.dom.querySelector('[data-resize-container][data-node="blockImage"]') as HTMLElement

    expect(container).not.toBeNull()
    expect(container.style.display).toBe('flex')
  })
})
