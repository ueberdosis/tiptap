import Blockquote from '@tiptap/extension-blockquote'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'

import { Editor } from '../Editor.js'

describe('setNode / setParagraph', () => {
  let editor: Editor

  afterEach(() => {
    editor?.destroy()
  })

  it('setParagraph lifts out of a blockquote even when setBlockType is a no-op', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, Blockquote],
      content: '<blockquote><p>quoted</p></blockquote>',
    })

    editor.commands.setTextSelection(2)

    const handled = editor.commands.setParagraph()

    expect(handled).toBe(true)
    expect(editor.getHTML()).toBe('<p>quoted</p>')
  })

  it('setParagraph returns false and does not dispatch on an existing paragraph', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, Blockquote],
      content: '<p>plain</p>',
    })

    editor.commands.setTextSelection(1)

    const dispatch = vi.spyOn(editor.view, 'dispatch')

    const handled = editor.commands.setParagraph()

    expect(handled).toBe(false)
    expect(dispatch).not.toHaveBeenCalled()
    expect(editor.getHTML()).toBe('<p>plain</p>')
  })

  it('lets first() fall back when setParagraph changes nothing', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, Blockquote],
      content: '<p>plain</p>',
    })

    editor.commands.setTextSelection(1)

    const fallback = vi.fn(() => true)

    const handled = editor.commands.first(({ commands }) => [
      () => commands.setParagraph(),
      fallback,
    ])

    expect(handled).toBe(true)
    expect(fallback).toHaveBeenCalledTimes(1)
  })

  it('ignores changes made earlier in the same transaction', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, Blockquote],
      content: '<p>plain</p><p>other</p>',
    })

    editor.commands.setTextSelection(1)

    let setParagraphResult: boolean | undefined

    editor.commands.command(({ tr, commands }) => {
      tr.insertText('x', tr.doc.content.size - 1)
      setParagraphResult = commands.setParagraph()

      return true
    })

    expect(setParagraphResult).toBe(false)
    expect(editor.getHTML()).toBe('<p>plain</p><p>otherx</p>')
  })

  it('can() reports a possible lift out of a blockquote', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, Blockquote],
      content: '<blockquote><p>quoted</p></blockquote><p>plain</p>',
    })

    editor.commands.setTextSelection(2)

    expect(editor.can().setParagraph()).toBe(true)
    expect(editor.can().chain().setParagraph().run()).toBe(true)

    editor.commands.setTextSelection(editor.state.doc.content.size - 1)

    expect(editor.can().setParagraph()).toBe(false)
  })
})
