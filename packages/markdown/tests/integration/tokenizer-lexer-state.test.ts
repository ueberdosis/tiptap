import { Document } from '@tiptap/extension-document'
import { BulletList, ListItem } from '@tiptap/extension-list'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Text } from '@tiptap/extension-text'
import { describe, expect, it } from 'vite-plus/test'

import { MarkdownManager } from '../../src/MarkdownManager.js'

describe('Custom tokenizer lexer state', () => {
  it('preserves list-item context across block-tokenization calls', () => {
    const tokenTypes: string[] = []
    const Probe = Paragraph.extend({
      name: 'probe',
      markdownTokenizer: {
        name: 'probe',
        level: 'block',
        start: () => -1,
        tokenize(src, _tokens, lexer) {
          if (src !== 'probe') {
            return undefined
          }

          tokenTypes.push(lexer.blockTokens('before')[0].type)
          tokenTypes.push(lexer.blockTokens('after')[0].type)

          return { type: 'probe', raw: src }
        },
      },
      parseMarkdown: () => ({
        type: 'paragraph',
        content: [{ type: 'text', text: 'probe' }],
      }),
    })
    const manager = new MarkdownManager({
      extensions: [Document, Paragraph, Text, BulletList, ListItem, Probe],
    })

    manager.parse('- probe')

    expect(tokenTypes).toEqual(['text', 'text'])
  })
})
