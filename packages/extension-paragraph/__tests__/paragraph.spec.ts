import { generateHTML } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Text from '@tiptap/extension-text'
import { describe, expect, it } from 'vitest'

import Paragraph from '../src/index.js'

describe('Paragraph Extension - Whitespace Preservation', () => {
  it('should have preserveWhitespace option defaulting to false', () => {
    const extension = Paragraph.configure()

    expect(extension.options.preserveWhitespace).toBe(false)
  })

  it('should allow setting preserveWhitespace to true', () => {
    const extension = Paragraph.configure({ preserveWhitespace: true })

    expect(extension.options.preserveWhitespace).toBe(true)
  })

  it('should apply white-space: pre-wrap style when preserveWhitespace is true', () => {
    const html = generateHTML(
      {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Hello    world' }],
          },
        ],
      },
      [Document, Text, Paragraph.configure({ preserveWhitespace: true })],
    )

    expect(html).toContain('white-space: pre-wrap')
    expect(html).toContain('<p style="white-space: pre-wrap">Hello    world</p>')
  })

  it('should not apply white-space style when preserveWhitespace is false', () => {
    const html = generateHTML(
      {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Hello world' }],
          },
        ],
      },
      [Document, Text, Paragraph.configure({ preserveWhitespace: false })],
    )

    expect(html).not.toContain('white-space')
    expect(html).toBe('<p>Hello world</p>')
  })

  it('should preserve existing styles when adding whitespace style', () => {
    const html = generateHTML(
      {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Styled text' }],
          },
        ],
      },
      [
        Document,
        Text,
        Paragraph.configure({
          preserveWhitespace: true,
          HTMLAttributes: { style: 'color: red' },
        }),
      ],
    )

    expect(html).toContain('white-space: pre-wrap')
    expect(html).toContain('color: red')
  })

  it('should merge multiple style attributes correctly', () => {
    const html = generateHTML(
      {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Text' }],
          },
        ],
      },
      [
        Document,
        Text,
        Paragraph.configure({
          preserveWhitespace: true,
          HTMLAttributes: { style: 'font-size: 14px; font-weight: bold' },
        }),
      ],
    )

    expect(html).toContain('white-space: pre-wrap')
    expect(html).toContain('font-size: 14px')
    expect(html).toContain('font-weight: bold')
  })

  it('should preserve other HTML attributes when adding whitespace style', () => {
    const html = generateHTML(
      {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Classy text' }],
          },
        ],
      },
      [
        Document,
        Text,
        Paragraph.configure({
          preserveWhitespace: true,
          HTMLAttributes: { class: 'my-paragraph', 'data-test': 'value' },
        }),
      ],
    )

    expect(html).toContain('class="my-paragraph"')
    expect(html).toContain('data-test="value"')
    expect(html).toContain('white-space: pre-wrap')
  })
})
