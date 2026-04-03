import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { TrailingNode } from '@tiptap/extensions'
import { afterEach, describe, expect, it } from 'vitest'

import { BulletList, ListItem, OrderedList } from '../src/index.js'

describe('toggleList with trailing paragraph', () => {
  let editor: Editor

  afterEach(() => {
    editor?.destroy()
  })

  it('should toggle off bullet list when selecting all content including trailing paragraph', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, BulletList, OrderedList, ListItem, TrailingNode],
      content: '<ul><li><p>hello</p></li></ul>',
    })

    // Select all content (Cmd+A) - this includes the trailing empty paragraph
    editor.commands.selectAll()

    // Toggle bullet list should remove the list, not wrap trailing paragraph
    editor.commands.toggleBulletList()

    // The content should be a plain paragraph, not a list
    const json = editor.getJSON()
    expect(json.content?.[0]?.type).toBe('paragraph')
    expect(json.content?.[0]?.content?.[0]?.text).toBe('hello')

    // Should not have bulletList in the document
    expect(json.content?.some(node => node.type === 'bulletList')).toBe(false)
  })

  it('should toggle off ordered list when selecting all content including trailing paragraph', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, BulletList, OrderedList, ListItem, TrailingNode],
      content: '<ol><li><p>hello</p></li></ol>',
    })

    // Select all content (Cmd+A)
    editor.commands.selectAll()

    // Toggle ordered list should remove the list
    editor.commands.toggleOrderedList()

    // The content should be a plain paragraph, not a list
    const json = editor.getJSON()
    expect(json.content?.[0]?.type).toBe('paragraph')
    expect(json.content?.[0]?.content?.[0]?.text).toBe('hello')

    // Should not have orderedList in the document
    expect(json.content?.some(node => node.type === 'orderedList')).toBe(false)
  })

  it('should toggle off list with multiple items when selecting all', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, BulletList, OrderedList, ListItem, TrailingNode],
      content: '<ul><li><p>item 1</p></li><li><p>item 2</p></li><li><p>item 3</p></li></ul>',
    })

    // Select all content
    editor.commands.selectAll()

    // Toggle bullet list should convert all items to paragraphs
    editor.commands.toggleBulletList()

    const json = editor.getJSON()

    // Should have 3 paragraphs
    expect(json.content?.length).toBeGreaterThanOrEqual(3)
    expect(json.content?.[0]?.type).toBe('paragraph')
    expect(json.content?.[0]?.content?.[0]?.text).toBe('item 1')
    expect(json.content?.[1]?.type).toBe('paragraph')
    expect(json.content?.[1]?.content?.[0]?.text).toBe('item 2')
    expect(json.content?.[2]?.type).toBe('paragraph')
    expect(json.content?.[2]?.content?.[0]?.text).toBe('item 3')

    // Should not have bulletList in the document
    expect(json.content?.some(node => node.type === 'bulletList')).toBe(false)
  })

  it('should work correctly when manually selecting only list content (without trailing paragraph)', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, BulletList, OrderedList, ListItem],
      content: '<ul><li><p>hello</p></li></ul>',
    })

    // Manually select only the list content (not including trailing paragraph)
    // Position 0 is start of doc, list starts at 1, content is at position 2-7
    editor.commands.setTextSelection({ from: 1, to: 9 })

    // Toggle bullet list should remove the list
    editor.commands.toggleBulletList()

    const json = editor.getJSON()
    expect(json.content?.[0]?.type).toBe('paragraph')
    expect(json.content?.[0]?.content?.[0]?.text).toBe('hello')
  })

  it('should handle list with non-empty trailing paragraph correctly', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, BulletList, OrderedList, ListItem, TrailingNode],
      content: '<ul><li><p>list item</p></li></ul><p>after list</p>',
    })

    // Select all content - this includes the non-empty paragraph after the list
    editor.commands.selectAll()

    // Toggle bullet list - this should wrap "after list" into the list
    // because it's not an empty trailing paragraph (it has content)
    editor.commands.toggleBulletList()

    const json = editor.getJSON()

    // The behavior with non-empty trailing content is different:
    // It should wrap the trailing paragraph into the list
    expect(json.content?.[0]?.type).toBe('bulletList')

    // Should have 2 list items now
    const bulletList = json.content?.[0]
    expect(bulletList?.content?.length).toBe(2)
    expect(bulletList?.content?.[0]?.content?.[0]?.content?.[0]?.text).toBe('list item')
    expect(bulletList?.content?.[1]?.content?.[0]?.content?.[0]?.text).toBe('after list')
  })
})
