import { Document } from '@tiptap/extension-document'
import { BulletList, ListItem, OrderedList } from '@tiptap/extension-list'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Text } from '@tiptap/extension-text'
import { MarkdownManager } from '@tiptap/markdown'
import { describe, expect, it } from 'vite-plus/test'

const manager = () =>
  new MarkdownManager({
    extensions: [Document, Paragraph, Text, BulletList, OrderedList, ListItem],
  } as any)

const paragraph = (text: string) => ({ type: 'paragraph', content: [{ type: 'text', text }] })
const item = (...content: any[]) => ({ type: 'listItem', content })

describe('ordered list nested in a bullet list inside an ordered list item', () => {
  it('keeps the ordered list inside the bullet item (#8472)', () => {
    const markdown = ['1. one', '   - two', '     1. three', '     2. four'].join('\n')
    const doc = manager().parse(markdown) as any

    expect(doc.content).toEqual([
      {
        type: 'orderedList',
        content: [
          item(paragraph('one'), {
            type: 'bulletList',
            content: [
              item(paragraph('two'), {
                type: 'orderedList',
                content: [item(paragraph('three')), item(paragraph('four'))],
              }),
            ],
          }),
        ],
      },
    ])
  })

  it('round-trips the nesting unchanged (#8472)', () => {
    const mm = manager()
    const markdown = ['1. one', '   - two', '     1. three', '     2. four', '2. five'].join('\n')

    expect(mm.serialize(mm.parse(markdown) as any)).toBe(markdown)
  })

  it('keeps the ordered list together when an item of it has a deeper bullet list', () => {
    const markdown = [
      '1. one',
      '   - two',
      '     1. three',
      '        - child',
      '     2. four',
    ].join('\n')
    const doc = manager().parse(markdown) as any

    expect(doc.content).toEqual([
      {
        type: 'orderedList',
        content: [
          item(paragraph('one'), {
            type: 'bulletList',
            content: [
              item(paragraph('two'), {
                type: 'orderedList',
                content: [
                  item(paragraph('three'), {
                    type: 'bulletList',
                    content: [item(paragraph('child'))],
                  }),
                  item(paragraph('four')),
                ],
              }),
            ],
          }),
        ],
      },
    ])
  })

  it('still makes an ordered list at the item content indent a sibling of the bullet list', () => {
    const markdown = ['1. one', '   - two', '   1. three'].join('\n')
    const doc = manager().parse(markdown) as any
    const outerItem = doc.content[0].content[0]

    expect(outerItem.content.map((node: any) => node.type)).toEqual([
      'paragraph',
      'bulletList',
      'orderedList',
    ])
  })
})
