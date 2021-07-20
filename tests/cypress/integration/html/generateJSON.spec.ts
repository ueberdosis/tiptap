/// <reference types="cypress" />

import { generateJSON } from '@tiptap/html'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import TextAlign from '@tiptap/extension-text-align'

describe('generateJSON', () => {
  it('generate JSON from HTML without an editor instance', () => {
    const html = '<p>Example Text</p>'

    const json = generateJSON(html, [
      Document,
      Paragraph,
      Text,
    ])

    expect(JSON.stringify(json)).to.eq(JSON.stringify({
      type: 'doc',
      content: [{
        type: 'paragraph',
        content: [{
          type: 'text',
          text: 'Example Text',
        }],
      }],
    }))
  })

  // issue: https://github.com/ueberdosis/tiptap/issues/1601
  it('generate JSON with style attributes', () => {
    const html = '<p style="text-align: center;">Example Text</p>'

    const json = generateJSON(html, [
      Document,
      Paragraph,
      Text,
      TextAlign.configure({ types: ['paragraph'] })
    ])

    expect(JSON.stringify(json)).to.eq(JSON.stringify({
      type: 'doc',
      content: [{
        type: 'paragraph',
        attrs: {
          textAlign: 'center'
        },
        content: [{
          type: 'text',
          text: 'Example Text',
        }],
      }],
    }))
  })
})
