import { Document } from '@tiptap/extension-document'
import { ListItem, OrderedList } from '@tiptap/extension-list'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Text } from '@tiptap/extension-text'
import { describe, expect, it } from 'vite-plus/test'

import { MarkdownManager } from '../../src/MarkdownManager.js'

const listItem = (text: string, nested?: unknown[]) => ({
  type: 'listItem',
  content: [
    {
      type: 'paragraph',
      content: [{ type: 'text', text }],
    },
    ...(nested ?? []),
  ],
})

describe('Ordered list indentation parsing', () => {
  const markdownManager = new MarkdownManager({
    extensions: [Document, Paragraph, Text, OrderedList, ListItem],
  })

  it('keeps items indented less than the first item as siblings', () => {
    const markdown = [' 9. nine', '10. ten'].join('\n')

    expect(markdownManager.parse(markdown)).toEqual({
      type: 'doc',
      content: [
        {
          type: 'orderedList',
          attrs: { start: 9 },
          content: [listItem('nine'), listItem('ten')],
        },
      ],
    })
  })

  it('keeps right-aligned items inside the list they are nested in', () => {
    const markdown = ['1. parent', '    1. one', '    2. two', '    9. nine', '   10. ten'].join(
      '\n',
    )

    expect(markdownManager.parse(markdown)).toEqual({
      type: 'doc',
      content: [
        {
          type: 'orderedList',
          content: [
            listItem('parent', [
              {
                type: 'orderedList',
                content: [listItem('one'), listItem('two'), listItem('nine'), listItem('ten')],
              },
            ]),
          ],
        },
      ],
    })
  })

  it('keeps an item that stops short of a wide marker content column a sibling', () => {
    const markdown = ['10. ten', '   1. inner', '11. eleven'].join('\n')

    expect(markdownManager.parse(markdown)).toEqual({
      type: 'doc',
      content: [
        {
          type: 'orderedList',
          attrs: { start: 10 },
          content: [listItem('ten'), listItem('inner'), listItem('eleven')],
        },
      ],
    })
  })

  it('nests an item that reaches the content column of a narrow marker', () => {
    const markdown = ['1. ten', '   2. inner', '2. eleven'].join('\n')

    expect(markdownManager.parse(markdown)).toEqual({
      type: 'doc',
      content: [
        {
          type: 'orderedList',
          content: [
            listItem('ten', [
              {
                type: 'orderedList',
                attrs: { start: 2 },
                content: [listItem('inner')],
              },
            ]),
            listItem('eleven'),
          ],
        },
      ],
    })
  })

  it('keeps shallower siblings that follow a nested list', () => {
    const markdown = ['1. one', '    1. nested', '2. two'].join('\n')

    expect(markdownManager.parse(markdown)).toEqual({
      type: 'doc',
      content: [
        {
          type: 'orderedList',
          content: [
            listItem('one', [{ type: 'orderedList', content: [listItem('nested')] }]),
            listItem('two'),
          ],
        },
      ],
    })
  })

  it('keeps every level of a deeply indented list', () => {
    const markdown = ['1. one', '    1. two', '        1. three', '2. four'].join('\n')

    expect(markdownManager.parse(markdown)).toEqual({
      type: 'doc',
      content: [
        {
          type: 'orderedList',
          content: [
            listItem('one', [
              {
                type: 'orderedList',
                content: [listItem('two', [{ type: 'orderedList', content: [listItem('three')] }])],
              },
            ]),
            listItem('four'),
          ],
        },
      ],
    })
  })

  it.each(['\t', ' \t', '  \t', '   \t'])('nests a child indented with %j', indent => {
    const markdown = ['10. ten', `${indent}1. inner`, '11. eleven'].join('\n')
    const spaces = ['10. ten', '    1. inner', '11. eleven'].join('\n')

    expect(markdownManager.parse(markdown)).toEqual(markdownManager.parse(spaces))
  })

  it.each(['   ', '    '])('uses tab stops after the marker with %j indentation', indent => {
    const markdown = ['1.\tparent', `${indent}1. item`, '2. end'].join('\n')
    const spaces = ['1.  parent', `${indent}1. item`, '2. end'].join('\n')

    expect(markdownManager.parse(markdown)).toEqual(markdownManager.parse(spaces))
  })

  it('keeps nesting through multiple tabs', () => {
    const markdown = ['1. parent', '\t1. child', '\t\t1. grandchild', '2. end'].join('\n')
    const spaces = ['1. parent', '    1. child', '        1. grandchild', '2. end'].join('\n')

    expect(markdownManager.parse(markdown)).toEqual(markdownManager.parse(spaces))
  })

  it('counts the full prefix of an empty item', () => {
    const markdown = ['10.\t', '\t1. child', '11. end'].join('\n')
    const spaces = ['10. ', '    1. child', '11. end'].join('\n')

    expect(markdownManager.parse(markdown)).toEqual(markdownManager.parse(spaces))
  })

  it('preserves continuation text inside a tab-indented item', () => {
    const markdown = ['1. parent', '\t1. child', '   continuation', '2. end'].join('\n')

    expect(markdownManager.parse(markdown)).toEqual({
      type: 'doc',
      content: [
        {
          type: 'orderedList',
          content: [
            listItem('parent', [
              { type: 'orderedList', content: [listItem('child\ncontinuation')] },
            ]),
            listItem('end'),
          ],
        },
      ],
    })
  })

  it('parses its tab-indented serialization without losing nesting', () => {
    const manager = new MarkdownManager({
      extensions: [Document, Paragraph, Text, OrderedList, ListItem],
      indentation: { style: 'tab', size: 1 },
    })
    const document = manager.parse('10. ten\n    1. inner\n11. eleven')

    expect(manager.parse(manager.serialize(document))).toEqual(document)
  })
})
