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

  it('strips trailing space tokens so gap whitespace does not create phantom empty paragraphs', () => {
    const token: MarkdownToken = {
      type: 'list_item',
      raw: '- list 2\n\n\n\n',
      text: 'list 2\n\n\n',
      tokens: [
        {
          type: 'paragraph',
          raw: 'list 2',
          text: 'list 2',
          tokens: [
            {
              type: 'text',
              raw: 'list 2',
              text: 'list 2',
            },
          ],
        },
        {
          type: 'space',
          raw: '\n\n\n',
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
      parseBlockChildren: tokens =>
        tokens.map(t => ({
          type: t.type,
          text: t.text,
        })),
      createTextNode: text => ({ type: 'text', text }),
      createNode: (type, attrs, content) => ({ type, attrs, content }),
      applyMark: (mark, content) => ({ mark, content }),
    }

    const result = ListItem.config.parseMarkdown?.(token, helpers) as any
    expect(result.content).toHaveLength(1)
    expect(result.content[0].type).toBe('paragraph')
  })
})
