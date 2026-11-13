import { Document } from '@tiptap/extension-document'
import { ListItem, OrderedList } from '@tiptap/extension-list'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Text } from '@tiptap/extension-text'
import { describe, expect, it } from 'vite-plus/test'

import { MarkdownManager } from '../../src/MarkdownManager.js'

describe('ordered lists that start at zero', () => {
  const markdownManager = new MarkdownManager({
    extensions: [Document, Paragraph, Text, OrderedList, ListItem],
  })

  it('keeps the zero as the list start', () => {
    const json = markdownManager.parse('0. zero\n1. one')

    expect(json.content?.[0]?.attrs?.start).toBe(0)
  })

  it('numbers every item from the zero start', () => {
    const json = markdownManager.parse('0. zero\n1. one')

    expect(markdownManager.serialize(json)).toBe('0. zero\n1. one')
  })

  it('roundtrips a list whose single item starts at zero', () => {
    const json = markdownManager.parse('0. zero')

    expect(markdownManager.serialize(json)).toBe('0. zero')
    expect(markdownManager.parse(markdownManager.serialize(json))).toEqual(json)
  })

  it('keeps other start values unchanged', () => {
    expect(markdownManager.serialize(markdownManager.parse('3. three\n4. four'))).toBe(
      '3. three\n4. four',
    )
    expect(markdownManager.serialize(markdownManager.parse('1. one\n2. two'))).toBe(
      '1. one\n2. two',
    )
  })
})
