import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { afterEach, describe, expect, it } from 'vite-plus/test'

import { Editor } from '../Editor.js'
import { Node } from '../Node.js'
import { ResizableNodeView } from './ResizableNodeView.js'

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

    const container = editor.view.dom.querySelector(
      '[data-resize-container][data-node="inlineImage"]',
    ) as HTMLElement

    expect(container).not.toBeNull()
    expect(container.style.display).toBe('inline-flex')
  })

  it('should use flex display for block nodes', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, BlockImage],
      content: '<img data-type="block" src="test.png" />',
    })

    const container = editor.view.dom.querySelector(
      '[data-resize-container][data-node="blockImage"]',
    ) as HTMLElement

    expect(container).not.toBeNull()
    expect(container.style.display).toBe('flex')
  })
})

describe('ResizableNodeView dimension updates', () => {
  let editor: Editor

  afterEach(() => {
    editor?.destroy()
  })

  it('synchronizes changed and removed dimensions with the node attributes', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, BlockImage],
      content: '<img data-type="block" src="test.png" width="200" height="100" />',
    })

    const image = editor.view.dom.querySelector('img') as HTMLImageElement

    editor.commands.updateAttributes('blockImage', { width: 400, height: 300 })
    expect(image.style.width).toBe('400px')
    expect(image.style.height).toBe('300px')

    editor.commands.updateAttributes('blockImage', { width: null, height: null })
    expect(image.style.width).toBe('')
    expect(image.style.height).toBe('')
  })

  it('preserves the current drag dimensions when another attribute changes', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, BlockImage],
      content: '<img data-type="block" src="test.png" width="200" height="100" />',
    })

    const image = editor.view.dom.querySelector('img') as HTMLImageElement
    const handle = editor.view.dom.querySelector('[data-resize-handle]') as HTMLElement
    handle.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 0, clientY: 0 }))
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 400, clientY: 300 }))
    const width = image.style.width
    const height = image.style.height
    expect(width).not.toBe('200px')

    editor.commands.updateAttributes('blockImage', { src: 'changed.png' })
    expect(image.style.width).toBe(width)
    expect(image.style.height).toBe(height)
    document.dispatchEvent(new MouseEvent('mouseup'))
  })
})
