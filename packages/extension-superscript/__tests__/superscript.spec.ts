import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Superscript from '@tiptap/extension-superscript'
import Text from '@tiptap/extension-text'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

describe('Superscript', () => {
  let editor: Editor

  beforeEach(() => {
    const element = document.createElement('div')
    document.body.appendChild(element)
    editor = new Editor({
      element,
      extensions: [Document, Paragraph, Text, Superscript],
      content: '<p>Example Text</p>',
    })
    editor.commands.selectAll()
  })

  afterEach(() => {
    editor.destroy()
  })

  it('transforms inline style vertical-align: super to sup tags', () => {
    editor.commands.setContent('<p><span style="vertical-align: super">Example Text</span></p>')
    expect(editor.getHTML()).toBe('<p><sup>Example Text</sup></p>')
  })

  it('omits inline style with a different vertical-align', () => {
    editor.commands.setContent('<p><span style="vertical-align: middle">Example Text</span></p>')
    expect(editor.getHTML()).toBe('<p>Example Text</p>')
  })

  it('toggleSuperscript wraps the selection in a sup tag', () => {
    editor.commands.toggleSuperscript()
    expect(editor.getHTML()).toBe('<p><sup>Example Text</sup></p>')
  })

  it('toggleSuperscript twice removes the sup tag', () => {
    editor.commands.toggleSuperscript()
    editor.commands.selectAll()
    editor.commands.toggleSuperscript()
    expect(editor.getHTML()).toBe('<p>Example Text</p>')
  })
})
