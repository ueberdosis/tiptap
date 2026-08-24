import { Editor } from '@tiptap/editor'
import { Document } from '@tiptap/editor/extensions/document'
import { Paragraph } from '@tiptap/editor/extensions/paragraph'
import { Text } from '@tiptap/editor/extensions/text'
import { Color } from '@tiptap/editor/extensions/color'
import { TextStyle } from '@tiptap/editor/extensions/text-style'
import { afterEach, beforeEach, describe, expect, it } from 'vite-plus/test'

describe('Color commands', () => {
  let editor: Editor

  beforeEach(() => {
    const element = document.createElement('div')
    document.body.appendChild(element)
    editor = new Editor({
      element,
      extensions: [Document, Paragraph, Text, TextStyle, Color],
      content: '<p>Example Text</p>',
    })
    editor.commands.selectAll()
  })

  afterEach(() => {
    editor.destroy()
  })

  it('sets the color of the selected text', () => {
    expect(editor.isActive('textStyle', { color: '#958DF1' })).toBe(false)
    editor.commands.setColor('#958DF1')
    expect(editor.isActive('textStyle', { color: '#958DF1' })).toBe(true)
    const span = editor.view.dom.querySelector('span')
    expect(span?.textContent).toBe('Example Text')
    expect(span?.style.color).toBe('#958DF1')
  })

  it('removes the color of the selected text', () => {
    editor.commands.setColor('#958DF1')
    expect(editor.getHTML()).toContain('<span')

    editor.commands.unsetColor()
    expect(editor.getHTML()).not.toContain('<span')
  })

  it('exposes the active color via getAttributes', () => {
    editor.commands.setColor('#958DF1')
    expect(editor.getAttributes('textStyle').color).toBe('#958DF1')
  })
})
