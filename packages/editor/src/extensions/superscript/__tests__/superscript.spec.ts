import { Editor } from '@tiptap/editor'
import { Document } from '@tiptap/editor/extensions/document'
import { Paragraph } from '@tiptap/editor/extensions/paragraph'
import { Superscript } from '@tiptap/editor/extensions/superscript'
import { Text } from '@tiptap/editor/extensions/text'
import { afterEach, beforeEach, describe, expect, it } from 'vite-plus/test'

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
