import { Document } from '@tiptap/extension-document'
import { Link } from '@tiptap/extension-link'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Text } from '@tiptap/extension-text'
import { describe, expect, it } from 'vite-plus/test'

import { MarkdownManager } from '../../src/MarkdownManager.js'

const hrefsOf = (node: any): string[] => [
  ...(node.marks || [])
    .filter((mark: any) => mark.type === 'link')
    .map((mark: any) => mark.attrs.href),
  ...(node.content || []).flatMap(hrefsOf),
]

describe('HTML entities in link destinations', () => {
  const markdownManager = new MarkdownManager({
    extensions: [Document, Paragraph, Text, Link],
  })

  it.each([
    ['a bare URL', 'https://example.com/?a=1&amp;b=2'],
    ['an autolink', '<https://example.com/?a=1&amp;b=2>'],
    ['an inline link', '[x](https://example.com/?a=1&amp;b=2)'],
    ['a numeric reference', '[x](https://example.com/?a=1&#38;b=2)'],
  ])('decodes entities in the href of %s', (_, markdown) => {
    expect(hrefsOf(markdownManager.parse(markdown))).toEqual(['https://example.com/?a=1&b=2'])
  })

  it('keeps a plain URL with "&" intact', () => {
    expect(hrefsOf(markdownManager.parse('https://example.com/?a=1&b=2'))).toEqual([
      'https://example.com/?a=1&b=2',
    ])
  })

  it('keeps a typed URL with a query string working after a round trip', () => {
    const json = {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'https://example.com/?a=1&b=2' }] },
      ],
    }

    const reparsed = markdownManager.parse(markdownManager.serialize(json))

    expect(hrefsOf(reparsed)).toEqual(['https://example.com/?a=1&b=2'])
  })
})
