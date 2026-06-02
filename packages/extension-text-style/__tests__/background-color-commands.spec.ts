import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { BackgroundColor, TextStyle } from '@tiptap/extension-text-style'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

describe('BackgroundColor commands', () => {
  let editor: Editor

  beforeEach(() => {
    const element = document.createElement('div')
    document.body.appendChild(element)
    editor = new Editor({
      element,
      extensions: [Document, Paragraph, Text, TextStyle, BackgroundColor],
      content: '<p>Example Text</p>',
    })
    editor.commands.selectAll()
  })

  afterEach(() => {
    editor.destroy()
  })

  it('sets the background color of the selected text', () => {
    expect(editor.isActive('textStyle', { backgroundColor: '#958DF1' })).toBe(false)
    editor.commands.setBackgroundColor('#958DF1')
    expect(editor.isActive('textStyle', { backgroundColor: '#958DF1' })).toBe(true)
    expect(editor.getHTML()).toContain(
      '<span style="background-color: #958DF1;">Example Text</span>',
    )
  })

  it('removes the background color of the selected text', () => {
    editor.commands.setBackgroundColor('#958DF1')
    expect(editor.getHTML()).toContain('<span')

    editor.commands.unsetBackgroundColor()
    expect(editor.getHTML()).not.toContain('<span')
    expect(editor.isActive('textStyle', { backgroundColor: '#958DF1' })).toBe(false)
  })

  it('exposes the active backgroundColor via getAttributes', () => {
    editor.commands.setBackgroundColor('#958DF1')
    expect(editor.getAttributes('textStyle').backgroundColor).toBe('#958DF1')
  })
})
