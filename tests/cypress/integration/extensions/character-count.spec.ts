/// <reference types="cypress" />

import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { CharacterCount } from '@tiptap/extensions'

describe('CharacterCount initial trim', () => {
  const limit = 100

  it('trims from the end when initial content exceeds limit', () => {
    const longText =
      "Let's make sure people can't write more than 100 characters. I bet you could build one of the biggest social networks on that idea."
    const editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        CharacterCount.configure({ limit }),
      ],
      content: `<p>${longText}</p>`,
    })

    const text = editor.getText()
    const count = editor.storage.characterCount.characters()

    expect(count).to.be.at.most(limit)
    expect(text.startsWith("Let's make sure people can't write more than 100 characters.")).to.be
      .true
    expect(text).not.to.include('one of the biggest social networks on that idea.')

    editor.destroy()
  })

  it('keeps content under limit unchanged', () => {
    const shortText = 'Hello world'
    const editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        CharacterCount.configure({ limit }),
      ],
      content: `<p>${shortText}</p>`,
    })

    expect(editor.getText()).to.eq(shortText)
    expect(editor.storage.characterCount.characters()).to.eq(shortText.length)

    editor.destroy()
  })

  it('respects limit exactly when content equals limit', () => {
    const exactText = 'a'.repeat(limit)
    const editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        CharacterCount.configure({ limit }),
      ],
      content: `<p>${exactText}</p>`,
    })

    expect(editor.storage.characterCount.characters()).to.eq(limit)
    expect(editor.getText().length).to.eq(limit)

    editor.destroy()
  })
})
