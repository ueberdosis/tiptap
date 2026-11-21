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
    ['a bare URL', 'https://example.com/?a=1&b=2', 'https://example.com/?a=1&b=2'],
    ['a bare URL with &amp;', 'https://example.com/?a=1&amp;b=2', 'https://example.com/?a=1&b=2'],
    ['an autolink', '<https://example.com/?a=1&amp;b=2>', 'https://example.com/?a=1&b=2'],
    ['a link', '[x](https://example.com/?a=1&amp;b=2)', 'https://example.com/?a=1&b=2'],
    ['a link with &apos;', '[x](https://example.com/it&apos;s)', "https://example.com/it's"],
    ['a link with &copy;', '[x](https://example.com/&copy;)', 'https://example.com/©'],
    ['a link with &#41;', '[x](https://example.com/a&#41;b)', 'https://example.com/a)b'],
  ])('decodes %s', (_name, input, expected) => {
    expect(linkOf(markdownManager.parse(input))?.href).toBe(expected)
  })

  it('decodes each entity once', () => {
    const json = markdownManager.parse('[x](https://example.com/?a=1&amp;amp;b=2)')

    expect(linkOf(json)?.href).toBe('https://example.com/?a=1&amp;b=2')
  })

  it('keeps an escaped ampersand literal', () => {
    const json = markdownManager.parse('[x](https://example.com/?a=1\\&amp;b=2)')

    expect(linkOf(json)?.href).toBe('https://example.com/?a=1&amp;b=2')
  })

  it('resolves backslash escapes in a destination', () => {
    const json = markdownManager.parse('[x](https://example.com/a\\.b)')

    expect(linkOf(json)?.href).toBe('https://example.com/a.b')
  })

  it('keeps a backslash that is not an escape', () => {
    const json = markdownManager.parse('[x](https://example.com/a\\b)')

    expect(linkOf(json)?.href).toBe('https://example.com/a\\b')
  })

  it('round-trips a URL with a query string', () => {
    const json = markdownManager.parse('https://example.com/?a=1&b=2')
    const output = markdownManager.serialize(json)

    expect(linkOf(markdownManager.parse(output))?.href).toBe('https://example.com/?a=1&b=2')
    expect(markdownManager.parse(output)).toEqual(json)
  })

  it('round-trips a destination containing parentheses', () => {
    const json = markdownManager.parse('[x](https://example.com/a&#40;b&#41;c)')
    const output = markdownManager.serialize(json)

    expect(output).toBe('[x](https://example.com/a&#40;b&#41;c)')
    expect(markdownManager.parse(output)).toEqual(json)
  })

  it('round-trips a destination containing whitespace', () => {
    const json = markdownManager.parse('[x](https://example.com/a&#32;b)')

    expect(linkOf(json)?.href).toBe('https://example.com/a b')

    const output = markdownManager.serialize(json)

    expect(output).toBe('[x](https://example.com/a&#32;b)')
    expect(markdownManager.parse(output)).toEqual(json)
  })

  it('round-trips a destination containing a backslash', () => {
    const json = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'x',
              marks: [
                {
                  type: 'link',
                  attrs: { href: 'https://example.com/a\\b', title: null },
                },
              ],
            },
          ],
        },
      ],
    }
    const output = markdownManager.serialize(json)

    expect(output).toBe('[x](https://example.com/a\\\\b)')
    expect(markdownManager.parse(output)).toEqual(json)
  })

  it('round-trips a destination that literally contains &amp;', () => {
    const json = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'x',
              marks: [
                { type: 'link', attrs: { href: 'https://example.com/?a=1&amp;b=2', title: null } },
              ],
            },
          ],
        },
      ],
    }
    const output = markdownManager.serialize(json)

    expect(output).toBe('[x](https://example.com/?a=1&amp;amp;b=2)')
    expect(markdownManager.parse(output)).toEqual(json)
  })
})
