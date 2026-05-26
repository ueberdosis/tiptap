import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { FontFamily, TextStyle } from '@tiptap/extension-text-style'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

describe('FontFamily commands', () => {
  let editor: Editor

  beforeEach(() => {
    const element = document.createElement('div')
    document.body.appendChild(element)
    editor = new Editor({
      element,
      extensions: [Document, Paragraph, Text, TextStyle, FontFamily],
      content: '<p>Example Text</p>',
    })
    editor.commands.selectAll()
  })

  afterEach(() => {
    editor.destroy()
  })

  it('sets the font-family of the selected text', () => {
    expect(editor.isActive('textStyle', { fontFamily: 'monospace' })).toBe(false)
    editor.commands.setFontFamily('monospace')
    expect(editor.isActive('textStyle', { fontFamily: 'monospace' })).toBe(true)
    expect(editor.getHTML()).toContain('<span style="font-family: monospace">Example Text</span>')
  })

  it('removes the font-family of the selected text', () => {
    editor.commands.setFontFamily('monospace')
    expect(editor.getHTML()).toContain('<span')

    editor.commands.unsetFontFamily()
    expect(editor.getHTML()).not.toContain('<span')
  })

  it('allows CSS variables as a font-family', () => {
    editor.commands.setFontFamily('var(--title-font-family)')
    expect(editor.getHTML()).toContain(
      '<span style="font-family: var(--title-font-family)">Example Text</span>',
    )
  })

  it('allows fonts containing multiple font families', () => {
    editor.commands.setFontFamily('"Comic Sans MS", "Comic Sans"')
    expect(editor.getHTML()).toContain(
      '<span style="font-family: &quot;Comic Sans MS&quot;, &quot;Comic Sans&quot;">Example Text</span>',
    )
  })

  it('allows fonts containing a space and number as a font-family', () => {
    editor.commands.setFontFamily('"Exo 2"')
    expect(editor.getHTML()).toContain(
      '<span style="font-family: &quot;Exo 2&quot;">Example Text</span>',
    )
  })
})
