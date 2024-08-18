/// <reference types="cypress" />

import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Youtube from '@tiptap/extension-youtube'
import { generateHTML, generateJSON } from '@tiptap/html'

describe('generateHTML', () => {
  it('generate HTML from JSON without an editor instance', () => {
    const json = {
      type: 'doc',
      content: [{
        type: 'paragraph',
        content: [{
          type: 'text',
          text: 'Example Text',
        }],
      }],
    }

    const html = generateHTML(json, [
      Document,
      Paragraph,
      Text,
    ])

    expect(html).to.eq('<p>Example Text</p>')
  })

  it('can convert from & to html', async () => {
    const extensions = [Document, Text, Youtube]
    const html = `<p>Tiptap now supports YouTube embeds! Awesome!</p>
      <div data-youtube-video>
        <iframe src="https://www.youtube.com/watch?v=cqHqLQgVCgY"></iframe>
      </div>`
    const json = generateJSON(html, extensions)

    expect(generateHTML(json, extensions)).to.equal(html)
  })
})
