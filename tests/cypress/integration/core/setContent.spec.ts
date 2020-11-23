/// <reference types="cypress" />

import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'

describe('setContent', () => {
  it('returns true when setting the content', () => {
    const editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
      ],
    })

    const command = editor.commands.setContent('<p>Cindy Lauper</p>')

    expect(command).to.be.true
  })

  it('replaces the content when using setContent', () => {
    const editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
      ],
    })

    editor.commands.setContent('<p>Cindy Lauper</p>')

    expect(editor.getHTML()).to.eq('<p>Cindy Lauper</p>')
  })
})
