import Document from '@tiptap/extension-document'
import Link from '@tiptap/extension-link'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { MarkdownManager } from '@tiptap/markdown'
import { describe, expect, it } from 'vite-plus/test'

describe('link title in markdown', () => {
  const markdownManager = new MarkdownManager({ extensions: [Document, Paragraph, Text, Link] })

  it('keeps a link whose title contains double quotes after a round trip', () => {
    const doc = markdownManager.parse('[docs](https://tiptap.dev "the \\"new\\" docs")')
    const reparsed = markdownManager.parse(markdownManager.serialize(doc))

    expect(reparsed.content).toEqual([
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'docs',
            marks: [
              { type: 'link', attrs: { href: 'https://tiptap.dev', title: 'the "new" docs' } },
            ],
          },
        ],
      },
    ])
  })
})
