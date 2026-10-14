import { Document } from '@tiptap/extension-document'
import { HardBreak } from '@tiptap/extension-hard-break'
import { Heading } from '@tiptap/extension-heading'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Text } from '@tiptap/extension-text'
import { describe, expect, it } from 'vite-plus/test'

import { MarkdownManager } from '../../src/MarkdownManager.js'

describe('hard break in a heading', () => {
  const markdownManager = new MarkdownManager({
    extensions: [Document, Paragraph, Text, Heading, HardBreak],
  })

  const heading = {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 1 },
        content: [
          { type: 'text', text: 'Title' },
          { type: 'hardBreak' },
          { type: 'text', text: 'second line' },
        ],
      },
    ],
  }

  it('keeps the heading on one line', () => {
    expect(markdownManager.serialize(heading)).toBe('# Title<br>second line')
  })

  it('round-trips to the same heading', () => {
    const parsed = markdownManager.parse(markdownManager.serialize(heading))

    expect(parsed).toEqual(heading)
  })

  it('still writes a hard break in a paragraph as a markdown line break', () => {
    const paragraph = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'a' },
            { type: 'hardBreak' },
            { type: 'text', text: 'b' },
          ],
        },
      ],
    }

    expect(markdownManager.serialize(paragraph)).toBe('a  \nb')
  })
})
