import { generateHTML } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Text from '@tiptap/extension-text'
import { describe, expect, it } from 'vitest'

import Heading from '../src/index.js'

describe('Heading Extension - Whitespace Preservation', () => {
  it('should have preserveWhitespace option defaulting to false', () => {
    const extension = Heading.configure()

    expect(extension.options.preserveWhitespace).toBe(false)
  })

  it('should allow setting preserveWhitespace to true', () => {
    const extension = Heading.configure({ preserveWhitespace: true })

    expect(extension.options.preserveWhitespace).toBe(true)
  })

  it('should apply white-space: pre-wrap style when preserveWhitespace is true', () => {
    const html = generateHTML(
      {
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 1 },
            content: [{ type: 'text', text: 'Hello    world' }],
          },
        ],
      },
      [Document, Text, Heading.configure({ preserveWhitespace: true })],
    )

    expect(html).toContain('white-space: pre-wrap')
    expect(html).toContain('<h1 style="white-space: pre-wrap">Hello    world</h1>')
  })

  it('should not apply white-space style when preserveWhitespace is false', () => {
    const html = generateHTML(
      {
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 1 },
            content: [{ type: 'text', text: 'Hello world' }],
          },
        ],
      },
      [Document, Text, Heading.configure({ preserveWhitespace: false })],
    )

    expect(html).not.toContain('white-space')
    expect(html).toBe('<h1>Hello world</h1>')
  })

  it('should preserve existing styles when adding whitespace style', () => {
    const html = generateHTML(
      {
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: 'Styled heading' }],
          },
        ],
      },
      [
        Document,
        Text,
        Heading.configure({
          preserveWhitespace: true,
          HTMLAttributes: { style: 'font-weight: bold' },
        }),
      ],
    )

    expect(html).toContain('white-space: pre-wrap')
    expect(html).toContain('font-weight: bold')
  })

  it('should work with all heading levels', () => {
    const levels = [1, 2, 3, 4, 5, 6] as const

    levels.forEach(level => {
      const html = generateHTML(
        {
          type: 'doc',
          content: [
            {
              type: 'heading',
              attrs: { level },
              content: [{ type: 'text', text: `Level ${level} heading` }],
            },
          ],
        },
        [Document, Text, Heading.configure({ preserveWhitespace: true })],
      )

      expect(html).toContain(`<h${level} style="white-space: pre-wrap">`)
      expect(html).toContain(`Level ${level} heading</h${level}>`)
    })
  })

  it('should merge multiple style attributes correctly', () => {
    const html = generateHTML(
      {
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 3 },
            content: [{ type: 'text', text: 'Text' }],
          },
        ],
      },
      [
        Document,
        Text,
        Heading.configure({
          preserveWhitespace: true,
          HTMLAttributes: { style: 'font-size: 20px; color: blue' },
        }),
      ],
    )

    expect(html).toContain('white-space: pre-wrap')
    expect(html).toContain('font-size: 20px')
    expect(html).toContain('color: blue')
  })

  it('should preserve other HTML attributes when adding whitespace style', () => {
    const html = generateHTML(
      {
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 1 },
            content: [{ type: 'text', text: 'Classy heading' }],
          },
        ],
      },
      [
        Document,
        Text,
        Heading.configure({
          preserveWhitespace: true,
          HTMLAttributes: { class: 'my-heading', id: 'special' },
        }),
      ],
    )

    expect(html).toContain('class="my-heading"')
    expect(html).toContain('id="special"')
    expect(html).toContain('white-space: pre-wrap')
  })
})
