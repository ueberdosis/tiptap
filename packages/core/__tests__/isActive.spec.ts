import { Editor } from '@tiptap/core'
import CodeBlock from '@tiptap/extension-code-block'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { Color, FontFamily, TextStyle } from '@tiptap/extension-text-style'
import { afterEach, describe, expect, it } from 'vitest'

describe('isActive', () => {
  let editor: Editor | null = null

  afterEach(() => {
    editor?.destroy()
    editor = null
  })

  it('should check the current node', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text],
    })

    expect(editor.isActive('paragraph')).toBe(true)
  })

  it('should check non-existent nodes', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text],
    })

    expect(editor.isActive('doesNotExist')).toBe(false)
  })

  it('should check the current mark for correct values', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, TextStyle, FontFamily, Color],
      content: `
        <p><span style="font-family: Inter">text</span></p>
      `,
    })

    expect(editor.isActive('textStyle', { fontFamily: 'Inter' })).toBe(true)
  })

  it('should check the current mark for false values', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, TextStyle, FontFamily, Color],
      content: `
        <p><span style="font-family: Inter; color: red">text</span></p>
      `,
    })

    expect(editor.isActive('textStyle', { fontFamily: 'Comic Sans' })).toBe(false)
  })

  it('should check the current mark for any values', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, TextStyle, FontFamily],
      content: `
        <p><span style="font-family: Inter; color: red">text</span></p>
      `,
    })

    expect(editor.isActive('textStyle', { fontFamily: /.*/ })).toBe(true)
  })

  it('should check the current mark for correct values (multiple)', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, TextStyle, FontFamily, Color],
      content: `
        <p><span style="font-family: Inter; color: red">text</span></p>
      `,
    })

    expect(editor.isActive('textStyle', { fontFamily: 'Inter', color: 'red' })).toBe(true)
  })

  it('should check the current mark for false values (multiple)', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, TextStyle, FontFamily, Color],
      content: `
        <p><span style="font-family: Inter; color: red">text</span></p>
      `,
    })

    expect(editor.isActive('textStyle', { fontFamily: 'Inter', color: 'green' })).toBe(false)
  })

  it('should skip code blocks when checking the current mark', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, TextStyle, FontFamily, CodeBlock],
      content: `
        <pre>code</pre>
        <p><span style="font-family: Inter; color: red">text</span></p>
      `,
    })

    // Selection that touches the code block and paragraph
    editor.commands.setTextSelection({ from: 1, to: 9 })
    expect(editor.isActive('textStyle', { fontFamily: /.*/ })).toBe(true)

    // Selection that touches just the code block
    editor.commands.setTextSelection({ from: 1, to: 3 })
    expect(editor.isActive('textStyle', { fontFamily: /.*/ })).toBe(false)
  })
})
