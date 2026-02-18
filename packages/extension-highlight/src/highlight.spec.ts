import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { describe, expect, it } from 'vitest'

import { Highlight } from './highlight.js'

describe('highlight', () => {
  it('allows adjacent highlights with different colors', () => {
    const editor = new Editor({
      extensions: [Document, Text, Paragraph, Highlight.configure({ multicolor: true })],
      content: '<p><mark data-color="red">First</mark></p>',
    })

    editor.chain().focus('end').setHighlight({ color: 'blue' }).insertContent('Second').run()

    const html = editor.getHTML()

    // We expect two distinct mark tags with different colors
    expect(html).toContain('data-color="red"')
    expect(html).toContain('data-color="blue"')
    expect(html).toContain('>First</mark>')
    expect(html).toContain('>Second</mark>')

    const redMark = '<mark data-color="red" style="background-color: red; color: inherit">First</mark>'
    const blueMark = '<mark data-color="blue" style="background-color: blue; color: inherit">Second</mark>'

    expect(html).toContain(redMark)
    expect(html).toContain(blueMark)
  })

  it('keeps colors distinct when typing after switching', () => {
    const editor = new Editor({
      extensions: [Document, Text, Paragraph, Highlight.configure({ multicolor: true })],
      content: '<p></p>',
    })

    editor
      .chain()
      .focus()
      .setHighlight({ color: 'red' })
      .insertContent('A')
      .setHighlight({ color: 'blue' })
      .insertContent('B')
      .run()

    const html = editor.getHTML()
    expect(html).toContain('data-color="red"')
    expect(html).toContain('data-color="blue"')
  })
})
