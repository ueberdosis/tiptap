import { Code } from '@tiptap/extension-code'
import { Document } from '@tiptap/extension-document'
import { Image } from '@tiptap/extension-image'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Text } from '@tiptap/extension-text'
import { describe, expect, it } from 'vite-plus/test'

import { MarkdownManager } from '../src/MarkdownManager.js'

describe('Code spans containing backticks', () => {
  const markdownManager = new MarkdownManager({ extensions: [Document, Paragraph, Text, Code] })

  const codeSpan = (text: string) => ({
    type: 'doc',
    content: [{ type: 'paragraph', content: [{ type: 'text', text, marks: [{ type: 'code' }] }] }],
  })

  it.each([
    ['hello', '`hello`'],
    ['hello ` world', '``hello ` world``'],
    ['a ` b `` c', '```a ` b `` c```'],
    ['`leading', '`` `leading ``'],
    ['trailing`', '`` trailing` ``'],
    ['`', '`` ` ``'],
    ['``', '` `` `'],
  ])('serializes %j with a fence the content cannot close', (text, expected) => {
    expect(markdownManager.serialize(codeSpan(text))).toBe(expected)
  })

  it.each(['hello', 'hello ` world', 'a ` b `` c', '`leading', 'trailing`', '`', '``'])(
    'round-trips %j through serialize and parse',
    text => {
      const parsed = markdownManager.parse(markdownManager.serialize(codeSpan(text)))

      expect(parsed.content?.[0].content).toEqual([
        { type: 'text', text, marks: [{ type: 'code' }] },
      ])
    },
  )

  it('keeps a code span with a backtick separate from its surrounding text', () => {
    const doc = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Press ' },
            { type: 'text', text: '`', marks: [{ type: 'code' }] },
            { type: 'text', text: ' to open.' },
          ],
        },
      ],
    }

    const markdown = markdownManager.serialize(doc)

    expect(markdown).toBe('Press `` ` `` to open.')
    expect(markdownManager.parse(markdown).content?.[0].content).toEqual(doc.content[0].content)
  })

  it('fences both sides of a code mark that spans an inline atom', () => {
    const withImage = new MarkdownManager({
      extensions: [Document, Paragraph, Text, Code, Image.configure({ inline: true })],
    })
    const content = [
      { type: 'text', text: 'a`b', marks: [{ type: 'code' }] },
      { type: 'image', attrs: { src: 'x.png' }, marks: [{ type: 'code' }] },
      { type: 'text', text: 'c`d', marks: [{ type: 'code' }] },
    ]

    const markdown = withImage.serialize({
      type: 'doc',
      content: [{ type: 'paragraph', content }],
    })

    expect(markdown).toBe('``a`b``![](x.png)``c`d``')
  })
})
