/// <reference types="cypress" />

import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import History from '@tiptap/extension-history'

describe('can', () => {
  it('not undo', () => {
    const editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        History,
      ],
    })

    const canUndo = editor.can().undo()

    expect(canUndo).to.eq(false)
  })

  it('undo', () => {
    const editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        History,
      ],
    })

    editor.commands.setContent('foo')

    const canUndo = editor.can().undo()

    expect(canUndo).to.eq(true)
  })

  it('not chain undo', () => {
    const editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        History,
      ],
    })

    const canUndo = editor.can().chain().undo().run()

    expect(canUndo).to.eq(false)
  })

  it('chain undo', () => {
    const editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        History,
      ],
    })

    editor.commands.setContent('foo')

    const canUndo = editor.can().chain().undo().run()

    expect(canUndo).to.eq(true)
  })
})
