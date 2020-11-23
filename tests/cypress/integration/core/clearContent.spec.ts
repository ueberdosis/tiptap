/// <reference types="cypress" />

import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'

describe('clearContent', () => {
  it('returns true when clearing the content', () => {
    const editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
      ],
    })

    const command = editor.commands.clearContent()

    expect(command).to.be.true
  })

  it('clears the content when using clearContent', () => {
    const editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
      ],
    })

    editor.commands.clearContent()

    expect(editor.getHTML()).to.eq('<p></p>')
  })
})
