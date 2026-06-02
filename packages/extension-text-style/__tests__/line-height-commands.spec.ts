import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { LineHeight, TextStyle } from '@tiptap/extension-text-style'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

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
    { value: '1.5', style: 'line-height: 1.5;' },
    { value: '2.0', style: 'line-height: 2;' },
    { value: '4.0', style: 'line-height: 4;' },
  ]

  cases.forEach(({ value, style }) => {
    it(`sets line-height ${value} for the selected text`, () => {
      expect(editor.isActive('textStyle', { lineHeight: value })).toBe(false)
      editor.commands.toggleTextStyle({ lineHeight: value })
      expect(editor.isActive('textStyle', { lineHeight: value })).toBe(true)
      expect(editor.getHTML()).toContain(`<span style="${style}">Example Text</span>`)
    })
  })

  it('removes the line-height of the selected text', () => {
    editor.commands.toggleTextStyle({ lineHeight: '1.5' })
    expect(editor.getHTML()).toContain('<span style="line-height: 1.5;">')

    editor.commands.unsetLineHeight()
    expect(editor.getHTML()).not.toContain('<span')
  })
})
