import { CodeBlock } from '@tiptap/extension-code-block'
import { Document } from '@tiptap/extension-document'
import { Link } from '@tiptap/extension-link'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Text } from '@tiptap/extension-text'
import { MarkdownManager } from '@tiptap/markdown'
import { beforeEach, describe, expect, it } from 'vitest'

describe('Soft line breaks', () => {
  let markdownManager: MarkdownManager

  beforeEach(() => {
    markdownManager = new MarkdownManager({
      extensions: [Document, Paragraph, Text, Link, CodeBlock],
    })
  })

  it('collapses a soft-wrapped paragraph into a single line', () => {
    const doc = markdownManager.parse('foo\nbar')

    expect(doc.content).toEqual([
      { type: 'paragraph', content: [{ type: 'text', text: 'foo bar' }] },
    ])
  })

  it('collapses soft breaks around a link without dropping the flanking spaces', () => {
    const doc = markdownManager.parse(
      'You can try CommonMark here. This dingus is powered by\n[commonmark.js](https://github.com/commonmark/commonmark.js), the\nJavaScript reference implementation.',
    )

    expect(doc.content).toEqual([
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'You can try CommonMark here. This dingus is powered by ' },
          {
            type: 'text',
            text: 'commonmark.js',
            marks: [
              {
                type: 'link',
                attrs: { href: 'https://github.com/commonmark/commonmark.js', title: null },
              },
            ],
          },
          { type: 'text', text: ', the JavaScript reference implementation.' },
        ],
      },
    ])
  })

  it('keeps newlines inside a code block', () => {
    const doc = markdownManager.parse('```js\nconst a = 1;\nconst b = 2;\n```')

    expect(doc.content).toEqual([
      {
        type: 'codeBlock',
        attrs: { language: 'js' },
        content: [{ type: 'text', text: 'const a = 1;\nconst b = 2;' }],
      },
    ])
  })
})
