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

    expect(html).to.eq('<p xmlns="http://www.w3.org/1999/xhtml">Example Text</p>')
  })

  it('can convert from & to html', async () => {
    const extensions = [Document, Paragraph, Text, Youtube]
    const html = `<p>Tiptap now supports YouTube embeds! Awesome!</p>
      <div data-youtube-video>
        <iframe src="https://www.youtube.com/watch?v=cqHqLQgVCgY"></iframe>
      </div>`
    const json = generateJSON(html, extensions)

    expect(json).to.deep.equal({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Tiptap now supports YouTube embeds! Awesome!',
            },
          ],
        },
        {
          type: 'youtube',
          attrs: {
            src: 'https://www.youtube.com/watch?v=cqHqLQgVCgY',
            start: 0,
            width: 640,
            height: 480,
          },
        },
      ],
    })

    expect(generateHTML(json, extensions)).to.equal('<p xmlns="http://www.w3.org/1999/xhtml">Tiptap now supports YouTube embeds! Awesome!</p><div xmlns="http://www.w3.org/1999/xhtml" data-youtube-video=""><iframe width="640" height="480" allowfullscreen="true" autoplay="false" disablekbcontrols="false" enableiframeapi="false" endtime="0" ivloadpolicy="0" loop="false" modestbranding="false" origin="" playlist="" src="https://www.youtube.com/embed/cqHqLQgVCgY" start="0"></iframe></div>')
  })
})
