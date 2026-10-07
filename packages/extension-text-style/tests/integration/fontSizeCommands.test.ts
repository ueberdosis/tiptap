import { Editor } from '@tiptap/core'
import Blockquote from '@tiptap/extension-blockquote'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { Color, FontSize, TextStyle } from '@tiptap/extension-text-style'
import { afterEach, beforeEach, describe, expect, it } from 'vite-plus/test'

describe('FontSize commands', () => {
  let editor: Editor

  beforeEach(() => {
    const element = document.createElement('div')
    document.body.appendChild(element)
    editor = new Editor({
      element,
      extensions: [Document, Paragraph, Text, TextStyle, FontSize],
      content: '<p>Example Text</p>',
    })
    editor.commands.selectAll()
  })

  afterEach(() => {
    editor.destroy()
  })

  it('sets the font-size of the selected text', () => {
    expect(editor.isActive('textStyle', { fontSize: '28px' })).toBe(false)
    editor.commands.setFontSize('28px')
    expect(editor.isActive('textStyle', { fontSize: '28px' })).toBe(true)
    const span = editor.view.dom.querySelector('span')
    expect(span?.textContent).toBe('Example Text')
    expect(span?.style.fontSize).toBe('28px')
  })

  it('removes the font-size of the selected text', () => {
    editor.commands.setFontSize('28px')
    expect(editor.view.dom.querySelector('span')?.style.fontSize).toBe('28px')

    editor.commands.unsetFontSize()
    expect(editor.getHTML()).not.toContain('<span')
  })
})

describe('FontSize commands inside a wrapper node', () => {
  let editor: Editor

  const editorWith = (content: string) => {
    const element = document.createElement('div')
    document.body.appendChild(element)
    editor = new Editor({
      element,
      extensions: [Document, Paragraph, Text, Blockquote, TextStyle, Color, FontSize],
      content,
    })
    editor.commands.selectAll()
    return editor
  }

  afterEach(() => {
    editor.destroy()
  })

  it('keeps the other text styles when unsetting inside a blockquote', () => {
    editorWith(
      '<blockquote><p><span style="color: #ff0000; font-size: 28px">Example Text</span></p></blockquote>',
    )

    editor.commands.unsetFontSize()

    expect(editor.getHTML()).toContain('color: #ff0000')
    expect(editor.getHTML()).not.toContain('font-size')
  })

  it('keeps the other text styles when unsetting inside a paragraph', () => {
    editorWith('<p><span style="color: #ff0000; font-size: 28px">Example Text</span></p>')

    editor.commands.unsetFontSize()

    expect(editor.getHTML()).toContain('color: #ff0000')
    expect(editor.getHTML()).not.toContain('font-size')
  })
})
