import { CodeBlock } from '@tiptap/extension-code-block'
import { Document } from '@tiptap/extension-document'
import { TaskItem, TaskList } from '@tiptap/extension-list'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Text } from '@tiptap/extension-text'
import { describe, expect, it } from 'vite-plus/test'

import { MarkdownManager } from '../../src/MarkdownManager.js'

const extensions = [
  Document,
  Paragraph,
  Text,
  CodeBlock,
  TaskList,
  TaskItem.configure({ nested: true }),
]

describe('Task list continuation edge cases', () => {
  it('keeps continuations when a custom tokenizer recognizes the probe word', () => {
    const WordBlock = Paragraph.extend({
      name: 'wordBlock',
      markdownTokenizer: {
        name: 'wordBlock',
        level: 'block',
        start: () => -1,
        tokenize(src) {
          if (src.startsWith('text\n')) {
            return { type: 'wordBlock', raw: 'text\n' }
          }
          return undefined
        },
      },
      parseMarkdown: () => ({ type: 'paragraph', content: [{ type: 'text', text: 'text' }] }),
    })
    const manager = new MarkdownManager({ extensions: [...extensions, WordBlock] })
    const document = manager.parse('- [ ] First\n      continued')

    expect(document.content?.[0].content?.[0].content).toEqual([
      { type: 'paragraph', content: [{ type: 'text', text: 'First\ncontinued' }] },
    ])
  })

  it.each([':::custom', 'before :::custom'])(
    'preserves custom blocks on actual continuation lines: %s',
    line => {
      const CustomBlock = Paragraph.extend({
        name: 'customBlock',
        markdownTokenizer: {
          name: 'customBlock',
          level: 'block',
          start: ':::custom',
          tokenize(src) {
            const match = /^:::custom\n?/.exec(src)
            return match ? { type: 'customBlock', raw: match[0] } : undefined
          },
        },
        parseMarkdown: () => ({ type: 'paragraph', content: [{ type: 'text', text: 'Custom' }] }),
      })
      const manager = new MarkdownManager({ extensions: [...extensions, CustomBlock] })
      const document = manager.parse(`- [ ] First\n  ${line}`)

      expect(document.content?.[0].content?.[0].content?.[0]).toEqual({
        type: 'paragraph',
        content: [{ type: 'text', text: 'First' }],
      })
      expect(document.content?.[0].content?.[0].content?.at(-1)).toEqual({
        type: 'paragraph',
        content: [{ type: 'text', text: 'Custom' }],
      })
    },
  )

  it.each(['\t', ' \t', '\t ', '\t\t'])('keeps all text after %j indentation', indent => {
    const manager = new MarkdownManager({ extensions })
    const document = manager.parse(`- [ ] First\n${indent}continued`)

    expect(document.content?.[0].content?.[0].content).toEqual([
      { type: 'paragraph', content: [{ type: 'text', text: 'First\ncontinued' }] },
    ])
  })

  it('preserves tab-indented code after a blank line', () => {
    const manager = new MarkdownManager({ extensions })
    const document = manager.parse('- [ ] First\n\n  \t  code')

    expect(document.content?.[0].content?.[0].content).toEqual([
      { type: 'paragraph', content: [{ type: 'text', text: 'First' }] },
      { type: 'codeBlock', attrs: { language: null }, content: [{ type: 'text', text: 'code' }] },
    ])
  })
})
