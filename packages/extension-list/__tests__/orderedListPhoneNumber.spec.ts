import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { MarkdownManager } from '@tiptap/markdown'
import { describe, expect, it } from 'vitest'

import { BulletList, ListItem, OrderedList } from '../src/index.js'

describe('phone numbers starting a line', () => {
  const markdownManager = new MarkdownManager({
    extensions: [Document, Paragraph, Text, BulletList, OrderedList, ListItem],
  })

  const paragraph = (text: string) => ({
    type: 'doc',
    content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
  })

  it('keeps "(216) 555-1234" as a single paragraph', () => {
    // The mid-line "216)" must not split the paragraph into "(" + an ordered
    // list. A list marker only starts a list at the beginning of a line.
    const json = markdownManager.parse('(216) 555-1234')

    expect(json).toEqual(paragraph('(216) 555-1234'))
  })

  it('does not split "Call me at 555) later" mid-line', () => {
    const json = markdownManager.parse('Call me at 555) later')

    expect(json).toEqual(paragraph('Call me at 555) later'))
  })

  it('still treats a leading "216) ..." as an ordered list (CommonMark)', () => {
    const json = markdownManager.parse('216) 555-1234')

    expect(json).toEqual({
      type: 'doc',
      content: [
        {
          type: 'orderedList',
          attrs: { start: 216 },
          content: [
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: '555-1234' }] }],
            },
          ],
        },
      ],
    })
  })

  it('still splits a paragraph followed by a real ordered list', () => {
    const json = markdownManager.parse('Intro\n1. First\n2. Second')

    expect(json.content?.[0].type).toBe('paragraph')
    expect(json.content?.[1].type).toBe('orderedList')
  })

  it('does not interrupt a paragraph with a non-1 ordered list', () => {
    const json = markdownManager.parse('Intro\n3. Third\n4. Fourth')

    expect(json.content).toHaveLength(1)
    expect(json.content?.[0].type).toBe('paragraph')
  })
})
