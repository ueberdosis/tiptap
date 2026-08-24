import { Editor } from '@tiptap/editor'
import { Document } from '@tiptap/editor/extensions/document'
import { Paragraph } from '@tiptap/editor/extensions/paragraph'
import { Text } from '@tiptap/editor/extensions/text'
import { LineHeight } from '@tiptap/editor/extensions/line-height'
import { TextStyle } from '@tiptap/editor/extensions/text-style'
import { afterEach, beforeEach, describe, expect, it } from 'vite-plus/test'

describe('LineHeight commands', () => {
  let editor: Editor

  beforeEach(() => {
    const element = document.createElement('div')
    document.body.appendChild(element)
    editor = new Editor({
      element,
      extensions: [Document, Paragraph, Text, TextStyle, LineHeight],
      content: '<p>Example Text</p>',
    })
    editor.commands.selectAll()
  })

  afterEach(() => {
    editor.destroy()
  })

  const cases = [
    { value: '1.5', style: '1.5' },
    { value: '2.0', style: '2' },
    { value: '4.0', style: '4' },
  ]

  cases.forEach(({ value, style }) => {
    it(`sets line-height ${value} for the selected text`, () => {
      expect(editor.isActive('textStyle', { lineHeight: value })).toBe(false)
      editor.commands.toggleTextStyle({ lineHeight: value })
      expect(editor.isActive('textStyle', { lineHeight: value })).toBe(true)
      const span = editor.view.dom.querySelector('span')
      expect(span?.textContent).toBe('Example Text')
      expect(span?.style.lineHeight).toBe(style)
    })
  })

  it('removes the line-height of the selected text', () => {
    editor.commands.toggleTextStyle({ lineHeight: '1.5' })
    expect(editor.view.dom.querySelector('span')?.style.lineHeight).toBe('1.5')

    editor.commands.unsetLineHeight()
    expect(editor.getHTML()).not.toContain('<span')
  })
})
