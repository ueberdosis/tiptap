import { Code } from '@tiptap/extension-code'
import { Document } from '@tiptap/extension-document'
import { Heading } from '@tiptap/extension-heading'
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

  it('does not escape a block marker inside a multiline code span', () => {
    const doc = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'a\n2. b', marks: [{ type: 'code' }] }],
        },
      ],
    }

    const markdown = codeManager.serialize(doc)
    const node = codeManager.parse(markdown).content?.[0]

    expect(markdown).toBe('`a\n2. b`')
    expect(node?.type).toBe('paragraph')
    // Marked folds the newline inside a code span to a space on parse.
    expect(node?.content).toEqual([{ type: 'text', text: 'a 2. b', marks: [{ type: 'code' }] }])
  })
})
