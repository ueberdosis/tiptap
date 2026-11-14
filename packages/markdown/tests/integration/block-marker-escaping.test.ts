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
