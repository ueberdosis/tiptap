import { Document } from '@tiptap/extension-document'
import { HardBreak } from '@tiptap/extension-hard-break'
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
