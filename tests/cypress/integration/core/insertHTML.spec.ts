/// <reference types="cypress" />

import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'

describe('insertHTML', () => {
  it('returns true when inserting HTML', () => {
    const editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
      ],
    })

    const command = editor.commands.insertHTML('<p>Cindy Lauper</p>')

    expect(command).to.be.true
  })

  it('appends the content when using insertHTML', () => {
    const editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
      ],
    })

    editor.commands.insertHTML('<p>Cindy Lauper</p>')

    expect(editor.getHTML()).to.eq('<p></p><p>Cindy Lauper</p>')
  })
})
