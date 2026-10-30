import type { MarkdownParseHelpers, MarkdownToken } from '@tiptap/core'
import { describe, expect, it } from 'vite-plus/test'

import { ListItem } from '../index.js'

describe('ListItem markdown parsing', () => {
  it('falls back to plain text tokens when tokenizeInline is not available', () => {
    const token: MarkdownToken = {
      type: 'list_item',
      text: '1. Nested item',
      tokens: [
        {
          type: 'list',
          ordered: true,
          raw: '1. Nested item',
        },
      ],
    }
    const helpers: MarkdownParseHelpers = {
      parseInline: tokens =>
        tokens.map(inlineToken => ({
          type: 'text',
          text: inlineToken.text,
        })),
      parseChildren: () => [],
      createTextNode: text => ({ type: 'text', text }),
      createNode: (type, attrs, content) => ({ type, attrs, content }),
      applyMark: (mark, content) => ({ mark, content }),
    }

    expect(ListItem.config.parseMarkdown?.(token, helpers)).toEqual({
      type: 'listItem',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: '1. Nested item',
            },
          ],
        },
      ],
    })
  })

  describe('with a non-paragraph first block', () => {
    const helpers: MarkdownParseHelpers = {
      parseInline: tokens => tokens.map(token => ({ type: 'text', text: token.text })),
      parseChildren: () => [],
      parseBlockChildren: tokens => tokens.map(token => ({ type: token.type })),
      createTextNode: text => ({ type: 'text', text }),
      createNode: (type, attrs, content) => ({ type, attrs, content }),
      applyMark: (mark, content) => ({ mark, content }),
    }

    it('turns a leading heading into a paragraph', () => {
      const token: MarkdownToken = {
        type: 'list_item',
        tokens: [
          {
            type: 'heading',
            raw: '# Title',
            tokens: [{ type: 'text', text: 'Title', raw: 'Title' }],
          },
        ],
      }

      expect(ListItem.config.parseMarkdown?.(token, helpers)).toEqual({
        type: 'listItem',
        content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Title' }] }],
      })
    })

    it('puts an empty paragraph before any other leading block', () => {
      const token: MarkdownToken = {
        type: 'list_item',
        tokens: [{ type: 'blockquote', raw: '> quote' }],
      }

      expect(ListItem.config.parseMarkdown?.(token, helpers)).toEqual({
        type: 'listItem',
        content: [{ type: 'paragraph', content: [] }, { type: 'blockquote' }],
      })
    })
  })
})
