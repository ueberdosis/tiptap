/// <reference types="cypress" />

import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import TextStyle from '@tiptap/extension-text-style'
import FontFamily from '@tiptap/extension-font-family'
import Color from '@tiptap/extension-color'

describe('isActive', () => {
  it('should check the current node', () => {
    const editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
      ],
    })

    expect(editor.isActive('paragraph')).to.eq(true)
  })

  it('should check non-existent nodes', () => {
    const editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
      ],
    })

    expect(editor.isActive('doesNotExist')).to.eq(false)
  })

  it('should check the current mark for correct values', () => {
    const editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        TextStyle,
        FontFamily,
        Color,
      ],
      content: `
        <p><span style="font-family: Inter">text</span></p>
      `,
    })

    expect(editor.isActive('textStyle', { fontFamily: 'Inter' })).to.eq(true)
  })

  it('should check the current mark for false values', () => {
    const editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        TextStyle,
        FontFamily,
        Color,
      ],
      content: `
        <p><span style="font-family: Inter; color: red">text</span></p>
      `,
    })

    expect(editor.isActive('textStyle', { fontFamily: 'Comic Sans' })).to.eq(false)
  })

  it('should check the current mark for any values', () => {
    const editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        TextStyle,
        FontFamily,
      ],
      content: `
        <p><span style="font-family: Inter; color: red">text</span></p>
      `,
    })

    expect(editor.isActive('textStyle', { fontFamily: /.*/ })).to.eq(true)
  })

  it('should check the current mark for correct values (multiple)', () => {
    const editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        TextStyle,
        FontFamily,
        Color,
      ],
      content: `
        <p><span style="font-family: Inter; color: red">text</span></p>
      `,
    })

    expect(editor.isActive('textStyle', { fontFamily: 'Inter', color: 'red' })).to.eq(true)
  })

  it('should check the current mark for false values (multiple)', () => {
    const editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        TextStyle,
        FontFamily,
        Color,
      ],
      content: `
        <p><span style="font-family: Inter; color: red">text</span></p>
      `,
    })

    expect(editor.isActive('textStyle', { fontFamily: 'Inter', color: 'green' })).to.eq(false)
  })
})
