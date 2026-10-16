import { Document } from '@tiptap/extension-document'
import { Highlight } from '@tiptap/extension-highlight'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Text } from '@tiptap/extension-text'
import { describe, expect, it } from 'vite-plus/test'

import { MarkdownManager } from '../../src/MarkdownManager.js'

const collectMarks = (node: any): string[] => [
  ...(node.marks || []).map((mark: any) => mark.type),
  ...(node.content || []).flatMap(collectMarks),
]

describe('Highlight delimiters next to whitespace', () => {
  const markdownManager = new MarkdownManager({
    extensions: [Document, Paragraph, Text, Highlight],
  })

  it('does not highlight text between "==" that are surrounded by spaces', () => {
    const input = 'Check if a == b and c == d first'
    const json = markdownManager.parse(input)

    expect(collectMarks(json)).not.toContain('highlight')
    expect(markdownManager.serialize(json)).toBe(input)
  })

  it('does not highlight when only the closing "==" follows a space', () => {
    const input = 'a ==b == c'
    const json = markdownManager.parse(input)

    expect(collectMarks(json)).not.toContain('highlight')
    expect(markdownManager.serialize(json)).toBe(input)
  })

  it('still highlights text wrapped tightly in "=="', () => {
    const json = markdownManager.parse('Some ==marked words== here')

    expect(json.content?.[0]?.content).toEqual([
      { type: 'text', text: 'Some ' },
      { type: 'text', text: 'marked words', marks: [{ type: 'highlight' }] },
      { type: 'text', text: ' here' },
    ])
    expect(markdownManager.serialize(json)).toBe('Some ==marked words== here')
  })

  it('still highlights a single character', () => {
    const json = markdownManager.parse('==a==')

    expect(json.content?.[0]?.content).toEqual([
      { type: 'text', text: 'a', marks: [{ type: 'highlight' }] },
    ])
  })
})
