import { CodeBlock } from '@tiptap/extension-code-block'
import { Document } from '@tiptap/extension-document'
import { BulletList, ListItem, OrderedList, TaskItem, TaskList } from '@tiptap/extension-list'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Text } from '@tiptap/extension-text'
import { describe, expect, it } from 'vite-plus/test'

import { MarkdownManager } from '../../src/MarkdownManager.js'

describe('Task list continuation lines', () => {
  const manager = new MarkdownManager({
    extensions: [
      Document,
      Paragraph,
      Text,
      CodeBlock,
      BulletList,
      ListItem,
      OrderedList,
      TaskList,
      TaskItem.configure({ nested: true }),
    ],
  })

  it.each([2, 4, 6, 8])('joins a continuation indented by %i spaces into one paragraph', indent => {
    const markdown = [
      '- [ ] Agent tab renders the composer in all states (no session',
      `${' '.repeat(indent)}empty transcript + composer).`,
    ].join('\n')

    expect(manager.parse(markdown)).toEqual({
      type: 'doc',
      content: [
        {
          type: 'taskList',
          content: [
            {
              type: 'taskItem',
              attrs: { checked: false },
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Agent tab renders the composer in all states (no session\nempty transcript + composer).',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    })
  })

  it('keeps multiple continuation lines in the current item', () => {
    const markdown = ['- [x] First', '      second', '        third', '- [ ] Next'].join('\n')

    expect(manager.parse(markdown)).toMatchObject({
      content: [
        {
          type: 'taskList',
          content: [
            {
              attrs: { checked: true },
              content: [{ type: 'paragraph', content: [{ text: 'First\nsecond\nthird' }] }],
            },
            {
              attrs: { checked: false },
              content: [{ type: 'paragraph', content: [{ text: 'Next' }] }],
            },
          ],
        },
      ],
    })
  })

  it.each(['# Release checklist', '1. Install'])(
    'keeps opening task text in paragraph context: %s',
    text => {
      const markdown = [`- [ ] ${text}`, '      continued'].join('\n')

      expect(manager.parse(markdown)).toEqual({
        type: 'doc',
        content: [
          {
            type: 'taskList',
            content: [
              {
                type: 'taskItem',
                attrs: { checked: false },
                content: [
                  { type: 'paragraph', content: [{ type: 'text', text: `${text}\ncontinued` }] },
                ],
              },
            ],
          },
        ],
      })
    },
  )

  it('joins a task continuation inside a bullet list', () => {
    const markdown = ['- Parent', '  - [ ] First', '        continued'].join('\n')

    expect(manager.parse(markdown)).toEqual({
      type: 'doc',
      content: [
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [
                { type: 'paragraph', content: [{ type: 'text', text: 'Parent' }] },
                {
                  type: 'taskList',
                  content: [
                    {
                      type: 'taskItem',
                      attrs: { checked: false },
                      content: [
                        {
                          type: 'paragraph',
                          content: [{ type: 'text', text: 'First\ncontinued' }],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    })
  })

  it.each([
    ['- [ ] First line', '      continued'],
    ['- [ ] Parent', '  - [x] Child', '        continued'],
    ['- First line', '  continued'],
    ['1. First line', 'continued'],
  ])('keeps continuation lines inside list items after export and reimport: %j', (...lines) => {
    const document = manager.parse(lines.join('\n'))
    const exported = manager.serialize(document)

    expect(manager.parse(exported)).toEqual(document)
  })

  it.each([
    {
      name: 'a separate paragraph',
      lines: ['', '  Second paragraph'],
      node: { type: 'paragraph', content: [{ type: 'text', text: 'Second paragraph' }] },
    },
    {
      name: 'an indented code block after a blank line',
      lines: ['', '      const value = 1'],
      node: { type: 'codeBlock', content: [{ type: 'text', text: 'const value = 1' }] },
    },
    {
      name: 'a fenced code block',
      lines: ['  ```js', '  const value = 1', '  ```'],
      node: {
        type: 'codeBlock',
        attrs: { language: 'js' },
        content: [{ type: 'text', text: 'const value = 1' }],
      },
    },
    {
      name: 'a nested task list',
      lines: ['  - [x] Child', '        continued'],
      node: {
        type: 'taskList',
        content: [
          {
            type: 'taskItem',
            attrs: { checked: true },
            content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Child\ncontinued' }] }],
          },
        ],
      },
    },
    {
      name: 'a nested bullet list',
      lines: ['  - Child'],
      node: {
        type: 'bulletList',
        content: [
          {
            type: 'listItem',
            content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Child' }] }],
          },
        ],
      },
    },
  ])('preserves $name after a continuation', ({ lines, node }) => {
    const markdown = ['- [ ] First line', '      continued', ...lines].join('\n')

    expect(manager.parse(markdown)).toMatchObject({
      type: 'doc',
      content: [
        {
          type: 'taskList',
          content: [
            {
              type: 'taskItem',
              attrs: { checked: false },
              content: [
                { type: 'paragraph', content: [{ type: 'text', text: 'First line\ncontinued' }] },
                node,
              ],
            },
          ],
        },
      ],
    })
  })
})
