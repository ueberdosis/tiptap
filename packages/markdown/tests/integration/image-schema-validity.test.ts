import { getSchema } from '@tiptap/core'
import { Blockquote } from '@tiptap/extension-blockquote'
import { Document } from '@tiptap/extension-document'
import { Image } from '@tiptap/extension-image'
import { BulletList, ListItem } from '@tiptap/extension-list'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Table, TableCell, TableHeader, TableRow } from '@tiptap/extension-table'
import { Text } from '@tiptap/extension-text'
import { describe, expect, it } from 'vite-plus/test'

import { MarkdownManager } from '../../src/MarkdownManager.js'

const markdown = `| Image | Name |
|---|---|
| ![](a.png) | Alpha |

Some text ![](c.png) more text.

> ![](d.png)

![](e.png)`

const setup = (inline: boolean) => {
  const extensions = [
    Document,
    Paragraph,
    Text,
    Blockquote,
    Image.configure({ inline }),
    Table,
    TableRow,
    TableCell,
    TableHeader,
  ]

  return { schema: getSchema(extensions), markdownManager: new MarkdownManager({ extensions }) }
}

const countImages = (node: any): number =>
  (node.type === 'image' ? 1 : 0) +
  (node.content || []).reduce((sum: number, child: any) => sum + countImages(child), 0)

describe('Markdown images and schema validity', () => {
  describe.each([false, true])('with inline: %s', inline => {
    const { schema, markdownManager } = setup(inline)

    it('creates content that matches the schema', () => {
      const json = markdownManager.parse(markdown)

      expect(() => schema.nodeFromJSON(json).check()).not.toThrow()
    })

    it('keeps every image', () => {
      expect(countImages(markdownManager.parse(markdown))).toBe(4)
    })

    it('keeps the text around an image', () => {
      const json = markdownManager.parse('Some text ![](c.png) more text.')
      const text = schema.nodeFromJSON(json).textContent

      expect(text).toBe('Some text  more text.')
    })

    it('keeps the table cells in place', () => {
      const json = markdownManager.parse(markdown)
      const row = json.content?.[0].content?.[1]

      expect(row?.content).toHaveLength(2)
      expect(countImages(row?.content?.[0])).toBe(1)
      expect(schema.nodeFromJSON(row?.content?.[1] as any).textContent).toBe('Alpha')
    })
  })

  it.each([false, true])('keeps a list item with only an image valid (inline: %s)', inline => {
    const extensions = [
      Document,
      Paragraph,
      Text,
      BulletList,
      ListItem,
      Image.configure({ inline }),
    ]
    const json = new MarkdownManager({ extensions }).parse('- ![](a.png)')

    expect(() => getSchema(extensions).nodeFromJSON(json).check()).not.toThrow()
    expect(countImages(json)).toBe(1)
  })

  it('keeps a lone block image as a block', () => {
    const { markdownManager } = setup(false)

    expect(markdownManager.parse('![](e.png)').content?.[0].type).toBe('image')
  })

  it('wraps a lone inline image in a paragraph', () => {
    const { markdownManager } = setup(true)
    const node = markdownManager.parse('![](e.png)').content?.[0]

    expect(node?.type).toBe('paragraph')
    expect(node?.content?.[0].type).toBe('image')
  })
})
