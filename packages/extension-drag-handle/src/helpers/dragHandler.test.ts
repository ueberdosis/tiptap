import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { afterEach, describe, expect, it } from 'vite-plus/test'

import { dragHandler, getDragImageOffset, shouldResetMargin } from './dragHandler.js'

describe('getDragImageOffset', () => {
  it('anchors ltr previews to the left edge', () => {
    expect(getDragImageOffset('ltr', 180)).toBe(0)
  })

  it('anchors rtl previews to the right edge', () => {
    expect(getDragImageOffset('rtl', 180)).toBe(180)
  })
})

describe('shouldResetMargin', () => {
  it('resets the margin when no properties are provided', () => {
    expect(shouldResetMargin(undefined)).toBe(true)
  })

  it('resets the margin when the properties do not include a margin', () => {
    expect(shouldResetMargin(['color', 'font-size'])).toBe(true)
  })

  it('keeps the margin when the shorthand margin is requested', () => {
    expect(shouldResetMargin(['margin'])).toBe(false)
  })

  it('keeps the margin for longhand and logical margin properties', () => {
    expect(shouldResetMargin(['margin-bottom'])).toBe(false)
    expect(shouldResetMargin(['margin-inline-start'])).toBe(false)
  })

  it('ignores surrounding whitespace in property names', () => {
    expect(shouldResetMargin([' margin-top '])).toBe(false)
  })
})

describe('dragHandler', () => {
  let editor: Editor | undefined

  afterEach(() => {
    editor?.destroy()
    document.body.replaceChildren()
  })

  it('puts the dragged content on the data transfer for another editor', () => {
    const element = document.createElement('div')

    document.body.appendChild(element)
    editor = new Editor({
      element,
      extensions: [Document, Paragraph, Text],
      content: '<p>one</p><p>two</p>',
    })

    const data = new Map<string, string>()
    const dataTransfer = {
      clearData: () => data.clear(),
      setData: (type: string, value: string) => data.set(type, value),
      setDragImage: () => {},
    }

    dragHandler(
      { dataTransfer, clientX: 0, clientY: 0 } as unknown as DragEvent,
      editor,
      {
        enabled: true,
        rules: [],
        defaultRules: true,
        edgeDetection: { edges: [], threshold: 0, strength: 0 },
      },
      { node: editor.state.doc.child(0), pos: 0 },
    )

    expect(data.get('text/html')).toContain('>one</p>')
    expect(data.get('text/plain')).toBe('one')
  })
})
