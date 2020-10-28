/// <reference types="cypress" />

import generateHtml from '@tiptap/html'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'

describe('generateHtml', () => {
  it('generate HTML from JSON without an editor instance', () => {
    const json = {
      type: 'document',
      content: [{
        type: 'paragraph',
        content: [{
          type: 'text',
          text: 'Example Text',
        }],
      }],
    }

    const html = generateHtml(json, [
      Document(),
      Paragraph(),
      Text(),
    ])

    expect(html).to.eq('<p>Example Text</p>')
  })
})
