import type { AnyExtension } from '@tiptap/core'
import { Blockquote } from '@tiptap/extension-blockquote'
import { Document } from '@tiptap/extension-document'
import { BulletList, ListItem, OrderedList } from '@tiptap/extension-list'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Text } from '@tiptap/extension-text'
import { MarkdownManager } from '@tiptap/markdown'
import { beforeEach, describe, expect, it } from 'vitest'

describe('Paragraph Markdown Rendering', () => {
  let markdownManager: MarkdownManager

  beforeEach(() => {
    markdownManager = new MarkdownManager()
    const extensions: AnyExtension[] = [Document, Paragraph, Text, Blockquote, BulletList, OrderedList, ListItem]
    extensions.forEach(extension => {
      markdownManager.registerExtension(extension)
    })
  })

  describe('empty paragraphs at doc level', () => {
    it('should render an empty paragraph at doc root as &nbsp;', () => {
      const doc = {
        type: 'doc',
        content: [{ type: 'paragraph', content: [] }],
      }

      const raw = markdownManager.renderNodes(doc)
      expect(raw).toBe('&nbsp;')
    })

    it('should use &nbsp; to preserve a blank line between two content paragraphs', () => {
      const doc = {
        type: 'doc',
        content: [
          { type: 'paragraph', content: [{ type: 'text', text: 'First' }] },
          { type: 'paragraph', content: [] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Second' }] },
        ],
      }

      const markdown = markdownManager.serialize(doc)
      expect(markdown).toBe('First\n\n&nbsp;\n\nSecond')
    })

    it('should roundtrip a blank line between two paragraphs', () => {
      const input = 'First\n\n&nbsp;\n\nSecond'
      const json = markdownManager.parse(input)
      const output = markdownManager.serialize(json)
      expect(output.trim()).toBe(input)
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
      expect(markdown).not.toContain('&nbsp;')
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
      expect(markdown).not.toContain('&nbsp;')
    })

    it('should not emit &nbsp; for an empty paragraph inside a blockquote', () => {
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
      expect(markdown).not.toContain('&nbsp;')
    })

    it('should not collapse multiple empty paragraphs inside a blockquote — separators use > not &nbsp;', () => {
      // Two empty paragraphs between content should produce bare ">" separator
      // lines (blockquote's own blank-line mechanism), not "&nbsp;" markers.
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

      // No &nbsp; should leak into blockquote output
      expect(markdown).not.toContain('&nbsp;')

      // Content paragraphs must be preserved
      expect(markdown).toContain('> First')
      expect(markdown).toContain('> Second')

      // Empty paragraphs produce bare ">" separator lines, not empty strings
      // e.g. "> First\n>\n>\n>\n>\n> Second"
      const bareQuoteLines = markdown.split('\n').filter(line => line.trim() === '>')
      expect(bareQuoteLines.length).toBeGreaterThan(0)
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
  })
})
