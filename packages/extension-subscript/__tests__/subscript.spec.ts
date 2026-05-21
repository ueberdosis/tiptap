import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Subscript from '@tiptap/extension-subscript'
import Text from '@tiptap/extension-text'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

describe('Subscript', () => {
  let editor: Editor

  beforeEach(() => {
    const element = document.createElement('div')
    document.body.appendChild(element)
    editor = new Editor({
      element,
      extensions: [Document, Paragraph, Text, Subscript],
      content: '<p>Example Text</p>',
    })
    editor.commands.selectAll()
  })

  afterEach(() => {
    editor.destroy()
  })

  it('transforms inline style vertical-align: sub to sub tags', () => {
    editor.commands.setContent('<p><span style="vertical-align: sub">Example Text</span></p>')
    expect(editor.getHTML()).toBe('<p><sub>Example Text</sub></p>')
  })

  it('omits inline style with a different vertical-align', () => {
    editor.commands.setContent('<p><b style="vertical-align: middle">Example Text</b></p>')
    expect(editor.getHTML()).toBe('<p>Example Text</p>')
  })

  it('toggleSubscript wraps the selection in a sub tag', () => {
    editor.commands.toggleSubscript()
    expect(editor.getHTML()).toBe('<p><sub>Example Text</sub></p>')
  })

  it('toggleSubscript twice removes the sub tag', () => {
    editor.commands.toggleSubscript()
    editor.commands.selectAll()
    editor.commands.toggleSubscript()
    expect(editor.getHTML()).toBe('<p>Example Text</p>')
  })
})
