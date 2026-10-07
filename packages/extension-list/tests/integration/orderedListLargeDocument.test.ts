import Blockquote from '@tiptap/extension-blockquote'
import Document from '@tiptap/extension-document'
import Heading from '@tiptap/extension-heading'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { MarkdownManager } from '@tiptap/markdown'
import { describe, expect, it } from 'vite-plus/test'

import { BulletList, ListItem, OrderedList } from '../../src/index.js'

const markdownManager = new MarkdownManager({
  extensions: [Document, Paragraph, Text, Heading, Blockquote, BulletList, OrderedList, ListItem],
})

const buildDocument = (sections: number) =>
  Array.from(
    { length: sections },
    (_, index) =>
      `## Section ${index}\n\nParagraph ${index} text.\n\n` +
      `- bullet ${index}\n\n1. first ${index}\n2. second ${index}\n\n> quote ${index}`,
  ).join('\n\n')

describe('ordered lists in large documents', () => {
  it('reads a list that runs past the initial scan window', () => {
    const items = 200
    const markdown = Array.from(
      { length: items },
      (_, index) => `${index + 1}. item ${index}`,
    ).join('\n')

    const json = markdownManager.parse(markdown)

    expect(json.content).toHaveLength(1)
    expect(json.content?.[0].type).toBe('orderedList')
    expect(json.content?.[0].content).toHaveLength(items)
  })

  it('stops the list at the following paragraph', () => {
    const markdown = `${Array.from({ length: 120 }, (_, index) => `${index + 1}. item ${index}`).join('\n')}\n\nAfter the list.`

    const json = markdownManager.parse(markdown)

    expect(json.content).toHaveLength(2)
    expect(json.content?.[0].content).toHaveLength(120)
    expect(json.content?.[1]).toEqual({
      type: 'paragraph',
      content: [{ type: 'text', text: 'After the list.' }],
    })
  })

  it('matches a single parse of the same list split across the window boundary', () => {
    const short = markdownManager.parse('1. one\n2. two')
    const long = markdownManager.parse(
      Array.from({ length: 70 }, (_, index) => `${index + 1}. item ${index}`).join('\n'),
    )

    expect(short.content?.[0].type).toBe('orderedList')
    expect(long.content?.[0].content).toHaveLength(70)
  })

  it('parses a large document in roughly linear time', () => {
    const markdown = buildDocument(6000)

    expect(Buffer.byteLength(markdown)).toBeGreaterThan(400_000)

    const startedAt = performance.now()
    markdownManager.parse(markdown)
    const duration = performance.now() - startedAt

    // Quadratic scanning took ~37s here; ~250ms now. Loose enough for CI.
    expect(duration).toBeLessThan(2000)
  }, 60000)
})
