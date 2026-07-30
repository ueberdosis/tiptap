import type { MarkdownParseHelpers, MarkdownToken } from '@tiptap/core'
import { describe, expect, it } from 'vitest'

import { ListItem } from '../src/index.js'

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
})
