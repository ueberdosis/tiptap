import { Bold } from '@tiptap/extension-bold'
import { Document } from '@tiptap/extension-document'
import { Image } from '@tiptap/extension-image'
import { Link } from '@tiptap/extension-link'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Text } from '@tiptap/extension-text'
import { describe, expect, it } from 'vite-plus/test'

import { MarkdownManager } from '../../src/MarkdownManager.js'

const collectTypes = (node: any): string[] => [
  node.type,
  ...(node.content || []).flatMap(collectTypes),
]

describe('Literal "!" before a link', () => {
  const markdownManager = new MarkdownManager({
    extensions: [Document, Paragraph, Text, Bold, Link, Image],
  })

  it('escapes "!" so a following link is not reparsed as an image', () => {
    const input = 'Great news\\![the post](https://example.com/p)'
    const json = markdownManager.parse(input)
    const output = markdownManager.serialize(json)

    expect(output).toBe(input)
    expect(collectTypes(markdownManager.parse(output))).not.toContain('image')
    expect(markdownManager.parse(output)).toEqual(json)
  })

  it('escapes "!" before an autolink', () => {
    const json = markdownManager.parse('Great news!<https://example.com/p>')
    const output = markdownManager.serialize(json)

    expect(output).toBe('Great news\\![https://example.com/p](https://example.com/p)')
    expect(collectTypes(markdownManager.parse(output))).not.toContain('image')
    expect(markdownManager.parse(output)).toEqual(json)
  })

  it('escapes "!" when it sits in a different mark than the link', () => {
    const json = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Great news!', marks: [{ type: 'bold' }] },
            {
              type: 'text',
              text: 'the post',
              marks: [{ type: 'link', attrs: { href: 'https://example.com/p' } }],
            },
          ],
        },
      ],
    }
    const output = markdownManager.serialize(json)

    expect(collectTypes(markdownManager.parse(output))).not.toContain('image')
  })

  it('leaves "!" alone when it is not directly followed by a link', () => {
    expect(
      markdownManager.serialize(
        markdownManager.parse('Great news! [the post](https://example.com/p)'),
      ),
    ).toBe('Great news! [the post](https://example.com/p)')
    expect(
      markdownManager.serialize(markdownManager.parse('![alt](https://example.com/i.png)')),
    ).toBe('![alt](https://example.com/i.png)')
  })
})
