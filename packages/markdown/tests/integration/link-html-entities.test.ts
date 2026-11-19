import { Document } from '@tiptap/extension-document'
import { Link } from '@tiptap/extension-link'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Text } from '@tiptap/extension-text'
import { describe, expect, it } from 'vite-plus/test'

import { MarkdownManager } from '../../src/MarkdownManager.js'

const markdownManager = new MarkdownManager({
  extensions: [Document, Paragraph, Text, Link],
})

const linkOf = (json: any): { href: string } | undefined => {
  const stack = [json]
  while (stack.length) {
    const node = stack.pop()
    if (!node) {
      continue
    }
    const link = node.marks?.find((mark: any) => mark.type === 'link')
    if (link) {
      return link.attrs
    }
    if (node.content) {
      stack.push(...node.content)
    }
  }
  return undefined
}

describe('Link hrefs with HTML entities', () => {
  it.each([
    ['a bare URL', 'https://example.com/?a=1&b=2'],
    ['a bare URL with &amp;', 'https://example.com/?a=1&amp;b=2'],
    ['an autolink', '<https://example.com/?a=1&amp;b=2>'],
    ['a link', '[x](https://example.com/?a=1&amp;b=2)'],
  ])('decodes %s', (_name, input) => {
    const json = markdownManager.parse(input)

    expect(linkOf(json)?.href).toBe('https://example.com/?a=1&b=2')
  })

  it('decodes each entity once', () => {
    const json = markdownManager.parse('[x](https://example.com/?a=1&amp;amp;b=2)')

    expect(linkOf(json)?.href).toBe('https://example.com/?a=1&amp;b=2')
  })

  it('round-trips a URL with a query string', () => {
    const json = markdownManager.parse('https://example.com/?a=1&b=2')
    const output = markdownManager.serialize(json)

    expect(linkOf(markdownManager.parse(output))?.href).toBe('https://example.com/?a=1&b=2')
    expect(markdownManager.parse(output)).toEqual(json)
  })
})
