import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { Color, TextStyle } from '@tiptap/extension-text-style'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

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
    expect(editor.getHTML()).toContain('<span style="color: #958DF1;">Example Text</span>')
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
