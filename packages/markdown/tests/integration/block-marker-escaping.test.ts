import { Code } from '@tiptap/extension-code'
import { Document } from '@tiptap/extension-document'
import { Heading } from '@tiptap/extension-heading'
import { Link } from '@tiptap/extension-link'
import { BulletList, ListItem, OrderedList } from '@tiptap/extension-list'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Text } from '@tiptap/extension-text'
import { MarkdownManager } from '@tiptap/markdown'
import { beforeEach, describe, expect, it } from 'vite-plus/test'

describe('Block marker escaping on serialize', () => {
  let markdownManager: MarkdownManager

  beforeEach(() => {
    markdownManager = new MarkdownManager({
      extensions: [Document, Paragraph, Text, Heading, BulletList, OrderedList, ListItem],
    })
  })

  const paragraphDoc = (text: string) => ({
    type: 'doc',
    content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
  })

  const roundTrippedFirstNode = (markdown: string) => markdownManager.parse(markdown).content?.[0]

  it('escapes an ordered list marker at the start of a paragraph', () => {
    const markdown = markdownManager.serialize(paragraphDoc('1. January is the deadline'))

    expect(markdown).toBe('1\\. January is the deadline')
    const node = roundTrippedFirstNode(markdown)
    expect(node?.type).toBe('paragraph')
    expect(node?.content?.[0]?.text).toBe('1. January is the deadline')
  })

  it('escapes multi-digit ordered list markers', () => {
    const markdown = markdownManager.serialize(paragraphDoc('10. Oktober um 9 Uhr'))

    expect(markdown).toBe('10\\. Oktober um 9 Uhr')
    expect(roundTrippedFirstNode(markdown)?.type).toBe('paragraph')
  })

  it('escapes bullet markers at the start of a paragraph', () => {
    expect(markdownManager.serialize(paragraphDoc('- not a list item'))).toBe('\\- not a list item')
    expect(markdownManager.serialize(paragraphDoc('+ not a list item'))).toBe('\\+ not a list item')
    expect(roundTrippedFirstNode('\\- not a list item')?.type).toBe('paragraph')
    expect(roundTrippedFirstNode('\\+ not a list item')?.type).toBe('paragraph')
  })

  it('escapes a lone hash at the start of a paragraph', () => {
    const markdown = markdownManager.serialize(paragraphDoc('#'))

    expect(markdown).toBe('\\#')
    const node = roundTrippedFirstNode(markdown)
    expect(node?.type).toBe('paragraph')
    expect(node?.content?.[0]?.text).toBe('#')
  })

  it('escapes a thematic break run at the start of a paragraph', () => {
    const markdown = markdownManager.serialize(paragraphDoc('---'))

    expect(markdown).toBe('\\---')
    const node = roundTrippedFirstNode(markdown)
    expect(node?.type).toBe('paragraph')
    expect(node?.content?.[0]?.text).toBe('---')
  })

  it('escapes closing hashes at the end of a heading', () => {
    const doc = {
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Title ##' }] },
      ],
    }

    const markdown = markdownManager.serialize(doc)

    expect(markdown).toBe('# Title \\#\\#')
    const node = roundTrippedFirstNode(markdown)
    expect(node?.type).toBe('heading')
    expect(node?.content?.[0]?.text).toBe('Title ##')
  })

  it('keeps escaped block syntax escaped after a parse and serialize round trip', () => {
    expect(markdownManager.serialize(markdownManager.parse('\\# not a heading'))).toBe(
      '\\# not a heading',
    )
    expect(markdownManager.serialize(markdownManager.parse('1\\. not a list'))).toBe(
      '1\\. not a list',
    )
  })

  it('escapes a Setext underline in a paragraph', () => {
    const markdown = markdownManager.serialize(paragraphDoc('Title\n==='))
    const node = roundTrippedFirstNode(markdown)

    expect(markdown).toBe('Title\n\\===')
    expect(node?.type).toBe('paragraph')
    expect(node?.content?.map(part => part.text).join('')).toBe('Title\n===')
  })

  it('escapes a GFM table delimiter row in a paragraph', () => {
    const text = 'a | b\n| --- | --- |\nc | d'
    const markdown = markdownManager.serialize(paragraphDoc(text))
    const node = roundTrippedFirstNode(markdown)

    expect(markdown).toBe('a | b\n\\| --- \\| --- \\|\nc | d')
    expect(node?.type).toBe('paragraph')
    expect(node?.content?.map(part => part.text).join('')).toBe(text)
  })

  it('escapes a leading list marker on a single-hyphen table delimiter row', () => {
    const text = 'a | b\n- | -\nc | d'
    const markdown = markdownManager.serialize(paragraphDoc(text))
    const parsed = markdownManager.parse(markdown)

    expect(markdown).toBe('a | b\n\\- \\| -\nc | d')
    expect(parsed.content).toHaveLength(1)
    expect(parsed.content?.[0]?.type).toBe('paragraph')
    expect(parsed.content?.[0]?.content?.map(part => part.text).join('')).toBe(text)
  })

  it('leaves ordinary text starting with similar characters alone', () => {
    expect(markdownManager.serialize(paragraphDoc('C# and 3.14, e-mail'))).toBe(
      'C# and 3.14, e-mail',
    )
    expect(markdownManager.serialize(paragraphDoc('*emphasized* start'))).toBe(
      '\\*emphasized\\* start',
    )
    expect(markdownManager.serialize(paragraphDoc('2)nospace stays plain'))).toBe(
      '2)nospace stays plain',
    )
  })
})

describe('Block marker escaping inside inline code spans', () => {
  const codeManager = new MarkdownManager({
    extensions: [Document, Paragraph, Text, Code],
  })

  const codeParagraphDoc = (text: string) => ({
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [{ type: 'text', text, marks: [{ type: 'code' }] }],
      },
    ],
  })

  it('does not escape a block marker inside a multiline code span', () => {
    const markdown = codeManager.serialize(codeParagraphDoc('a\n2. b'))
    const parsed = codeManager.parse(markdown)

    // Serialize flattens the newline to the space Marked folds it to on parse,
    // so the parsed text matches the serialized code span exactly.
    expect(markdown).toBe('`a 2. b`')
    expect(parsed.content).toHaveLength(1)
    expect(parsed.content?.[0]?.type).toBe('paragraph')
    expect(parsed.content?.[0]?.content).toEqual([
      { type: 'text', text: 'a 2. b', marks: [{ type: 'code' }] },
    ])
  })

  it('keeps a heading marker inside a multiline code span from starting a heading', () => {
    const markdown = codeManager.serialize(codeParagraphDoc('a\n# b'))
    const parsed = codeManager.parse(markdown)

    expect(markdown).toBe('`a # b`')
    expect(parsed.content).toHaveLength(1)
    expect(parsed.content?.[0]?.type).toBe('paragraph')
    expect(parsed.content?.[0]?.content).toEqual([
      { type: 'text', text: 'a # b', marks: [{ type: 'code' }] },
    ])
  })

  it('keeps a bullet marker inside a multiline code span from starting a list', () => {
    const markdown = codeManager.serialize(codeParagraphDoc('a\n- b'))
    const parsed = codeManager.parse(markdown)

    expect(markdown).toBe('`a - b`')
    expect(parsed.content).toHaveLength(1)
    expect(parsed.content?.[0]?.type).toBe('paragraph')
    expect(parsed.content?.[0]?.content).toEqual([
      { type: 'text', text: 'a - b', marks: [{ type: 'code' }] },
    ])
  })

  it('flattens a CRLF line ending inside a multiline code span to one space', () => {
    const markdown = codeManager.serialize(codeParagraphDoc('a\r\n# b'))
    const parsed = codeManager.parse(markdown)

    expect(markdown).toBe('`a # b`')
    expect(parsed.content).toHaveLength(1)
    expect(parsed.content?.[0]?.type).toBe('paragraph')
    expect(parsed.content?.[0]?.content).toEqual([
      { type: 'text', text: 'a # b', marks: [{ type: 'code' }] },
    ])
  })

  it('keeps an HTML block start inside a multiline code span from starting an HTML block', () => {
    const markdown = codeManager.serialize(codeParagraphDoc('a\n<div>\nb'))
    const parsed = codeManager.parse(markdown)

    expect(markdown).toBe('`a <div> b`')
    expect(parsed.content).toHaveLength(1)
    expect(parsed.content?.[0]?.type).toBe('paragraph')
    expect(parsed.content?.[0]?.content).toEqual([
      { type: 'text', text: 'a <div> b', marks: [{ type: 'code' }] },
    ])
  })

  it('keeps a tilde fence inside a multiline code span from starting a fenced block', () => {
    const markdown = codeManager.serialize(codeParagraphDoc('a\n~~~\nb'))
    const parsed = codeManager.parse(markdown)

    expect(markdown).toBe('`a ~~~ b`')
    expect(parsed.content).toHaveLength(1)
    expect(parsed.content?.[0]?.type).toBe('paragraph')
    expect(parsed.content?.[0]?.content).toEqual([
      { type: 'text', text: 'a ~~~ b', marks: [{ type: 'code' }] },
    ])
  })

  it('keeps a backtick fence inside a multiline code span from starting a fenced block', () => {
    const markdown = codeManager.serialize(codeParagraphDoc('a\n```\nb'))
    const parsed = codeManager.parse(markdown)

    expect(markdown).toBe('`a ``` b`')
    expect(parsed.content).toHaveLength(1)
    expect(parsed.content?.[0]?.type).toBe('paragraph')
    expect(parsed.content?.[0]?.content).toEqual([
      { type: 'text', text: 'a ``` b', marks: [{ type: 'code' }] },
    ])
  })
})

describe('Block marker escaping with link titles', () => {
  const linkManager = new MarkdownManager({
    extensions: [Document, Paragraph, Text, Link],
  })

  it('preserves a newline inside a link title wrapped in backticks', () => {
    const doc = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'x',
              marks: [{ type: 'link', attrs: { href: 'https://example.com', title: '`a\nb`' } }],
            },
          ],
        },
      ],
    }

    const markdown = linkManager.serialize(doc)
    const parsed = linkManager.parse(markdown)

    expect(markdown).toBe('[x](https://example.com "`a\nb`")')
    expect(parsed.content).toHaveLength(1)
    expect(parsed.content?.[0]?.type).toBe('paragraph')
    expect(parsed.content?.[0]?.content).toEqual([
      {
        type: 'text',
        text: 'x',
        marks: [{ type: 'link', attrs: { href: 'https://example.com', title: '`a\nb`' } }],
      },
    ])
  })

  it('preserves a newline in a link title when the next line starts with a heading marker', () => {
    const doc = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'x',
              marks: [{ type: 'link', attrs: { href: 'https://example.com', title: '`a\n# b`' } }],
            },
          ],
        },
      ],
    }

    const markdown = linkManager.serialize(doc)
    const parsed = linkManager.parse(markdown)

    expect(markdown).toBe('[x](https://example.com "`a\n\\# b`")')
    expect(parsed.content).toHaveLength(1)
    expect(parsed.content?.[0]?.type).toBe('paragraph')
    expect(parsed.content?.[0]?.content).toEqual([
      {
        type: 'text',
        text: 'x',
        marks: [{ type: 'link', attrs: { href: 'https://example.com', title: '`a\n# b`' } }],
      },
    ])
  })

  it('preserves a newline in a link title when the next line starts with an HTML block', () => {
    const doc = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'x',
              marks: [
                { type: 'link', attrs: { href: 'https://example.com', title: '`a\n<div>`' } },
              ],
            },
          ],
        },
      ],
    }

    const markdown = linkManager.serialize(doc)
    const parsed = linkManager.parse(markdown)

    expect(markdown).toBe('[x](https://example.com "`a\n\\<div>`")')
    expect(parsed.content).toHaveLength(1)
    expect(parsed.content?.[0]?.type).toBe('paragraph')
    expect(parsed.content?.[0]?.content).toEqual([
      {
        type: 'text',
        text: 'x',
        marks: [{ type: 'link', attrs: { href: 'https://example.com', title: '`a\n<div>`' } }],
      },
    ])
  })
})
