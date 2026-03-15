import type { AnyExtension } from '@tiptap/core'
import { Blockquote } from '@tiptap/extension-blockquote'
import { Document } from '@tiptap/extension-document'
import { Heading } from '@tiptap/extension-heading'
import { BulletList, ListItem, OrderedList } from '@tiptap/extension-list'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Text } from '@tiptap/extension-text'
import { MarkdownManager } from '@tiptap/markdown'
import { beforeEach, describe, expect, it } from 'vitest'

describe('Paragraph Markdown Rendering', () => {
  let markdownManager: MarkdownManager

  beforeEach(() => {
    markdownManager = new MarkdownManager()
    const extensions: AnyExtension[] = [
      Document,
      Paragraph,
      Text,
      Heading,
      Blockquote,
      BulletList,
      OrderedList,
      ListItem,
    ]
    extensions.forEach(extension => {
      markdownManager.registerExtension(extension)
    })
  })

  describe('empty paragraphs at doc level', () => {
    it('should omit a lone empty paragraph at doc root', () => {
      const doc = {
        type: 'doc',
        content: [{ type: 'paragraph', content: [] }],
      }

      const raw = markdownManager.renderNodes(doc)
      expect(raw).toBe('')
    })

    it('should preserve a single empty paragraph between two content paragraphs as blank markdown lines', () => {
      const doc = {
        type: 'doc',
        content: [
          { type: 'paragraph', content: [{ type: 'text', text: 'First' }] },
          { type: 'paragraph', content: [] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Second' }] },
        ],
      }

      const markdown = markdownManager.serialize(doc)
      expect(markdown).toBe('First\n\n\n\nSecond')
    })

    it('should use &nbsp; to preserve additional blank paragraphs between two content paragraphs', () => {
      const doc = {
        type: 'doc',
        content: [
          { type: 'paragraph', content: [{ type: 'text', text: 'First' }] },
          { type: 'paragraph', content: [] },
          { type: 'paragraph', content: [] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Second' }] },
        ],
      }

      const markdown = markdownManager.serialize(doc)
      expect(markdown).toBe('First\n\n\n\n&nbsp;\n\nSecond')
    })

    it('should keep a preserved blank paragraph marker after the first blank paragraph', () => {
      const input = 'First\n\n&nbsp;\n\nSecond'
      const json = markdownManager.parse(input)
      const output = markdownManager.serialize(json)
      expect(output.trim()).toBe('First\n\n\n\nSecond')
    })

    it('should preserve a trailing empty paragraph as trailing markdown spacing', () => {
      const doc = {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Markdown Test' }] },
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Click "Parse Markdown" to load content from the left panel.' }],
          },
          { type: 'paragraph', content: [] },
        ],
      }

      const markdown = markdownManager.serialize(doc)
      expect(markdown).toBe('# Markdown Test\n\nClick "Parse Markdown" to load content from the left panel.\n\n')
    })
  })

  describe('empty paragraphs inside nested nodes', () => {
    it('should not emit &nbsp; for an empty paragraph inside a bullet list item', () => {
      const doc = {
        type: 'doc',
        content: [
          {
            type: 'bulletList',
            content: [
              {
                type: 'listItem',
                content: [{ type: 'paragraph', content: [] }],
              },
            ],
          },
        ],
      }

      const markdown = markdownManager.serialize(doc)
      expect(markdown).toBe('- ')
    })

    it('should not emit &nbsp; for an empty paragraph inside an ordered list item', () => {
      const doc = {
        type: 'doc',
        content: [
          {
            type: 'orderedList',
            content: [
              {
                type: 'listItem',
                content: [{ type: 'paragraph', content: [] }],
              },
            ],
          },
        ],
      }

      const markdown = markdownManager.serialize(doc)
      expect(markdown).toBe('1. ')
    })

    it('should keep the first empty paragraph inside a blockquote empty', () => {
      const doc = {
        type: 'doc',
        content: [
          {
            type: 'blockquote',
            content: [{ type: 'paragraph', content: [] }],
          },
        ],
      }

      const markdown = markdownManager.serialize(doc)
      expect(markdown).toBe('>')
    })

    it('should preserve multiple empty paragraphs inside a blockquote with &nbsp; after the first', () => {
      const doc = {
        type: 'doc',
        content: [
          {
            type: 'blockquote',
            content: [
              { type: 'paragraph', content: [{ type: 'text', text: 'First' }] },
              { type: 'paragraph', content: [] },
              { type: 'paragraph', content: [] },
              { type: 'paragraph', content: [{ type: 'text', text: 'Second' }] },
            ],
          },
        ],
      }

      const markdown = markdownManager.serialize(doc)

      expect(markdown).toContain('> First')
      expect(markdown).toContain('> Second')
      expect(markdown).toContain('> &nbsp;')
    })

    it('should roundtrip multiple empty paragraphs inside a blockquote without losing any', () => {
      const doc = {
        type: 'doc',
        content: [
          {
            type: 'blockquote',
            content: [
              { type: 'paragraph', content: [{ type: 'text', text: 'First' }] },
              { type: 'paragraph', content: [] },
              { type: 'paragraph', content: [] },
              { type: 'paragraph', content: [] },
              { type: 'paragraph', content: [{ type: 'text', text: 'Second' }] },
            ],
          },
        ],
      }

      const markdown = markdownManager.serialize(doc)
      const parsed = markdownManager.parse(markdown)
      const blockquote = parsed.content![0]

      expect(markdown).toBe('> First\n>\n>\n>\n> &nbsp;\n>\n> &nbsp;\n>\n> Second')
      expect(blockquote.type).toBe('blockquote')
      expect(blockquote.content).toHaveLength(5)
      expect(
        blockquote.content!.slice(1, 4).every(node => node.type === 'paragraph' && node.content?.length === 0),
      ).toBe(true)
    })

    it('should render content paragraphs inside bullet list items normally', () => {
      const doc = {
        type: 'doc',
        content: [
          {
            type: 'bulletList',
            content: [
              { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] }] },
              { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'World' }] }] },
            ],
          },
        ],
      }

      const markdown = markdownManager.serialize(doc)
      expect(markdown).toBe('- Hello\n- World')
    })

    it('should roundtrip consecutive empty paragraphs inside a bullet list item', () => {
      const doc = {
        type: 'doc',
        content: [
          {
            type: 'bulletList',
            content: [
              {
                type: 'listItem',
                content: [
                  { type: 'paragraph', content: [{ type: 'text', text: 'First' }] },
                  { type: 'paragraph', content: [] },
                  { type: 'paragraph', content: [] },
                  { type: 'paragraph', content: [{ type: 'text', text: 'Second' }] },
                ],
              },
            ],
          },
        ],
      }

      const markdown = markdownManager.serialize(doc)
      const parsed = markdownManager.parse(markdown)
      const listItem = parsed.content![0].content![0]

      expect(markdown).toBe('- First\n\n  \n\n  &nbsp;\n\n  Second')
      expect(listItem.type).toBe('listItem')
      expect(listItem.content).toHaveLength(4)
      expect(listItem.content![1].content).toEqual([])
      expect(listItem.content![2].content).toEqual([])
    })
  })
})
