import { Blockquote } from '@tiptap/extension-blockquote'
import { Bold } from '@tiptap/extension-bold'
import { CodeBlock } from '@tiptap/extension-code-block'
import { Document } from '@tiptap/extension-document'
import { HardBreak } from '@tiptap/extension-hard-break'
import { Heading } from '@tiptap/extension-heading'
import { HorizontalRule } from '@tiptap/extension-horizontal-rule'
import { BulletList, ListItem, OrderedList } from '@tiptap/extension-list'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Text } from '@tiptap/extension-text'
import { describe, expect, it } from 'vitest'

import { MarkdownManager } from '../src/MarkdownManager.js'

describe('Ordered list lazy continuation parsing', () => {
  const extensions = [Document, Paragraph, Text, HardBreak, BulletList, OrderedList, ListItem]

  it('keeps non-indented lazy continuation lines inside the current list item when breaks are enabled', () => {
    const markdownManager = new MarkdownManager({
      extensions,
      markedOptions: {
        breaks: true,
      },
    })

    const markdown = [
      '1. First item',
      'Continuation for the first item.',
      '',
      '2. Second item',
      'Continuation for the second item.',
    ].join('\n')

    expect(markdownManager.parse(markdown)).toEqual({
      type: 'doc',
      content: [
        {
          type: 'orderedList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    { type: 'text', text: 'First item' },
                    { type: 'hardBreak' },
                    { type: 'text', text: 'Continuation for the first item.' },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    { type: 'text', text: 'Second item' },
                    { type: 'hardBreak' },
                    { type: 'text', text: 'Continuation for the second item.' },
                  ],
                },
              ],
            },
          ],
        },
      ],
    })
  })

  it('keeps nested bullet lists as block content inside ordered list items', () => {
    const markdownManager = new MarkdownManager({
      extensions,
      markedOptions: {
        breaks: true,
      },
    })

    const markdown = ['1. one', '  - inner', '2. two'].join('\n')

    expect(markdownManager.parse(markdown)).toEqual({
      type: 'doc',
      content: [
        {
          type: 'orderedList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'one' }],
                },
                {
                  type: 'bulletList',
                  content: [
                    {
                      type: 'listItem',
                      content: [
                        {
                          type: 'paragraph',
                          content: [{ type: 'text', text: 'inner' }],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'two' }],
                },
              ],
            },
          ],
        },
      ],
    })
  })

  it('stops lazy continuation at a heading line', () => {
    const markdownManager = new MarkdownManager({
      extensions: [
        Document,
        Paragraph,
        Text,
        HardBreak,
        Bold,
        Heading,
        BulletList,
        OrderedList,
        ListItem,
      ],
    })

    const markdown = ['1. Plain text search', '### **Plain text search**'].join('\n')

    expect(markdownManager.parse(markdown)).toEqual({
      type: 'doc',
      content: [
        {
          type: 'orderedList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Plain text search' }],
                },
              ],
            },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 3 },
          content: [{ type: 'text', text: 'Plain text search', marks: [{ type: 'bold' }] }],
        },
      ],
    })
  })

  it('stops lazy continuation at heading lines of any level, for any item', () => {
    const markdownManager = new MarkdownManager({
      extensions: [
        Document,
        Paragraph,
        Text,
        HardBreak,
        Heading,
        BulletList,
        OrderedList,
        ListItem,
      ],
    })

    const markdown = ['1. one', '2. two', '###### six'].join('\n')

    expect(markdownManager.parse(markdown)).toEqual({
      type: 'doc',
      content: [
        {
          type: 'orderedList',
          content: [
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'one' }] }],
            },
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'two' }] }],
            },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 6 },
          content: [{ type: 'text', text: 'six' }],
        },
      ],
    })
  })

  it('keeps hashtag-like lines that are not headings as lazy continuation', () => {
    const markdownManager = new MarkdownManager({
      extensions: [
        Document,
        Paragraph,
        Text,
        HardBreak,
        Heading,
        BulletList,
        OrderedList,
        ListItem,
      ],
      markedOptions: {
        breaks: true,
      },
    })

    // "#hashtag" (no space) and "####### seven" (7 hashes) are not headings
    // per CommonMark, so they must remain lazy continuation text.
    const markdown = ['1. one', '#hashtag', '####### seven'].join('\n')

    expect(markdownManager.parse(markdown)).toEqual({
      type: 'doc',
      content: [
        {
          type: 'orderedList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    { type: 'text', text: 'one' },
                    { type: 'hardBreak' },
                    { type: 'text', text: '#hashtag' },
                    { type: 'hardBreak' },
                    { type: 'text', text: '####### seven' },
                  ],
                },
              ],
            },
          ],
        },
      ],
    })
  })

  it('parses indented heading lines as block content inside the list item', () => {
    const markdownManager = new MarkdownManager({
      extensions: [
        Document,
        Paragraph,
        Text,
        HardBreak,
        Heading,
        BulletList,
        OrderedList,
        ListItem,
      ],
    })

    const markdown = ['1. one', '   ### inner heading'].join('\n')

    expect(markdownManager.parse(markdown)).toEqual({
      type: 'doc',
      content: [
        {
          type: 'orderedList',
          content: [
            {
              type: 'listItem',
              content: [
                { type: 'paragraph', content: [{ type: 'text', text: 'one' }] },
                {
                  type: 'heading',
                  attrs: { level: 3 },
                  content: [{ type: 'text', text: 'inner heading' }],
                },
              ],
            },
          ],
        },
      ],
    })
  })

  const blockExtensions = [
    Document,
    Paragraph,
    Text,
    HardBreak,
    Heading,
    HorizontalRule,
    CodeBlock,
    Blockquote,
    BulletList,
    OrderedList,
    ListItem,
  ]

  const listWithSingleItem = (text: string) => ({
    type: 'orderedList',
    content: [
      {
        type: 'listItem',
        content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
      },
    ],
  })

  it.each(['---', '***', '___', '* * *', '- - -', '_ _ _'])(
    'stops lazy continuation at a "%s" thematic break',
    thematicBreak => {
      const markdownManager = new MarkdownManager({ extensions: blockExtensions })

      const markdown = ['1. one', thematicBreak, 'Outside paragraph'].join('\n')

      expect(markdownManager.parse(markdown)).toEqual({
        type: 'doc',
        content: [
          listWithSingleItem('one'),
          { type: 'horizontalRule' },
          { type: 'paragraph', content: [{ type: 'text', text: 'Outside paragraph' }] },
        ],
      })
    },
  )

  it.each(['```', '~~~'])('stops lazy continuation at a "%s" code fence', fence => {
    const markdownManager = new MarkdownManager({ extensions: blockExtensions })

    const markdown = ['1. one', fence, 'const x = 1', fence].join('\n')

    expect(markdownManager.parse(markdown)).toEqual({
      type: 'doc',
      content: [
        listWithSingleItem('one'),
        {
          type: 'codeBlock',
          attrs: { language: null },
          content: [{ type: 'text', text: 'const x = 1' }],
        },
      ],
    })
  })

  it('stops lazy continuation at an unindented bullet list marker', () => {
    const markdownManager = new MarkdownManager({ extensions: blockExtensions })

    const markdown = ['1. one', '- bullet'].join('\n')

    expect(markdownManager.parse(markdown)).toEqual({
      type: 'doc',
      content: [
        listWithSingleItem('one'),
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'bullet' }] }],
            },
          ],
        },
      ],
    })
  })

  it('parses indented non-dash thematic breaks as block content inside the list item', () => {
    const markdownManager = new MarkdownManager({ extensions: blockExtensions })

    const markdown = ['1. one', '   ***'].join('\n')

    expect(markdownManager.parse(markdown)).toEqual({
      type: 'doc',
      content: [
        {
          type: 'orderedList',
          content: [
            {
              type: 'listItem',
              content: [
                { type: 'paragraph', content: [{ type: 'text', text: 'one' }] },
                { type: 'horizontalRule' },
              ],
            },
          ],
        },
      ],
    })
  })

  it('keeps an indented "---" directly below item text as paragraph text (setext ambiguity)', () => {
    const markdownManager = new MarkdownManager({
      extensions: blockExtensions,
      markedOptions: {
        breaks: true,
      },
    })

    const markdown = ['1. one', '  ---'].join('\n')

    expect(markdownManager.parse(markdown)).toEqual({
      type: 'doc',
      content: [
        {
          type: 'orderedList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    { type: 'text', text: 'one' },
                    { type: 'hardBreak' },
                    { type: 'text', text: '---' },
                  ],
                },
              ],
            },
          ],
        },
      ],
    })
  })

  it('keeps dash-prefixed text that is not a thematic break as lazy continuation', () => {
    const markdownManager = new MarkdownManager({
      extensions: blockExtensions,
      markedOptions: {
        breaks: true,
      },
    })

    const markdown = ['1. one', '---foo'].join('\n')

    expect(markdownManager.parse(markdown)).toEqual({
      type: 'doc',
      content: [
        {
          type: 'orderedList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    { type: 'text', text: 'one' },
                    { type: 'hardBreak' },
                    { type: 'text', text: '---foo' },
                  ],
                },
              ],
            },
          ],
        },
      ],
    })
  })

  it('keeps a setext-style "===" line as lazy continuation text', () => {
    const markdownManager = new MarkdownManager({
      extensions: blockExtensions,
      markedOptions: {
        breaks: true,
      },
    })

    const markdown = ['1. one', '==='].join('\n')

    expect(markdownManager.parse(markdown)).toEqual({
      type: 'doc',
      content: [
        {
          type: 'orderedList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    { type: 'text', text: 'one' },
                    { type: 'hardBreak' },
                    { type: 'text', text: '===' },
                  ],
                },
              ],
            },
          ],
        },
      ],
    })
  })

  it('keeps unindented blockquote lines inside the list item (matches marked 17.0.1)', () => {
    const markdownManager = new MarkdownManager({ extensions: blockExtensions })

    const markdown = ['1. one', '> quoted'].join('\n')

    expect(markdownManager.parse(markdown)).toEqual({
      type: 'doc',
      content: [
        {
          type: 'orderedList',
          content: [
            {
              type: 'listItem',
              content: [
                { type: 'paragraph', content: [{ type: 'text', text: 'one' }] },
                {
                  type: 'blockquote',
                  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'quoted' }] }],
                },
              ],
            },
          ],
        },
      ],
    })
  })

  it('stops lazy continuation after a blank line', () => {
    const markdownManager = new MarkdownManager({
      extensions,
      markedOptions: {
        breaks: true,
      },
    })

    const markdown = ['1. one', 'lazy continuation', '', 'Outside paragraph'].join('\n')

    expect(markdownManager.parse(markdown)).toEqual({
      type: 'doc',
      content: [
        {
          type: 'orderedList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    { type: 'text', text: 'one' },
                    { type: 'hardBreak' },
                    { type: 'text', text: 'lazy continuation' },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Outside paragraph' }],
        },
      ],
    })
  })
})
