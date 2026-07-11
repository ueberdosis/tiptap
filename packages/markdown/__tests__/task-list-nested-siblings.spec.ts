import { Document } from '@tiptap/extension-document'
import { BulletList, ListItem, TaskItem, TaskList } from '@tiptap/extension-list'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Text } from '@tiptap/extension-text'
import { describe, expect, it } from 'vitest'

import { MarkdownManager } from '../src/MarkdownManager.js'

const paragraph = (text: string) => ({
  type: 'paragraph',
  content: [{ type: 'text', text }],
})

const listItem = (text: string) => ({
  type: 'listItem',
  content: [paragraph(text)],
})

const taskItem = (text: string, ...nested: object[]) => ({
  type: 'taskItem',
  attrs: { checked: false },
  content: [paragraph(text), ...nested],
})

describe('Task list with non-checkbox siblings in nested lists', () => {
  const markdownManager = new MarkdownManager({
    extensions: [
      Document,
      Paragraph,
      Text,
      BulletList,
      ListItem,
      TaskList,
      TaskItem.configure({ nested: true }),
    ],
  })

  it('keeps a plain bullet that follows a checkbox item in a nested list', () => {
    const markdown = ['- [ ] parent', '  - [ ] checkbox child', '  - plain child'].join('\n')

    expect(markdownManager.parse(markdown)).toEqual({
      type: 'doc',
      content: [
        {
          type: 'taskList',
          content: [
            taskItem(
              'parent',
              { type: 'taskList', content: [taskItem('checkbox child')] },
              { type: 'bulletList', content: [listItem('plain child')] },
            ),
          ],
        },
      ],
    })
  })

  it('keeps multiple trailing plain bullets in one bullet list', () => {
    const markdown = ['- [ ] parent', '  - [ ] checkbox child', '  - plain 1', '  - plain 2'].join(
      '\n',
    )

    expect(markdownManager.parse(markdown)).toEqual({
      type: 'doc',
      content: [
        {
          type: 'taskList',
          content: [
            taskItem(
              'parent',
              { type: 'taskList', content: [taskItem('checkbox child')] },
              { type: 'bulletList', content: [listItem('plain 1'), listItem('plain 2')] },
            ),
          ],
        },
      ],
    })
  })

  it('keeps a plain bullet in a deeply nested task list', () => {
    const markdown = [
      '- [ ] parent',
      '  - [ ] level2',
      '    - [ ] level3',
      '    - deep plain',
    ].join('\n')

    expect(markdownManager.parse(markdown)).toEqual({
      type: 'doc',
      content: [
        {
          type: 'taskList',
          content: [
            taskItem('parent', {
              type: 'taskList',
              content: [
                taskItem(
                  'level2',
                  { type: 'taskList', content: [taskItem('level3')] },
                  { type: 'bulletList', content: [listItem('deep plain')] },
                ),
              ],
            }),
          ],
        },
      ],
    })
  })

  it('keeps a trailing paragraph that follows a nested checkbox item', () => {
    const markdown = ['- [ ] parent', '  - [ ] child', '  trailing paragraph'].join('\n')

    expect(markdownManager.parse(markdown)).toEqual({
      type: 'doc',
      content: [
        {
          type: 'taskList',
          content: [
            taskItem(
              'parent',
              { type: 'taskList', content: [taskItem('child')] },
              paragraph('trailing paragraph'),
            ),
          ],
        },
      ],
    })
  })

  it('keeps a plain bullet that precedes a checkbox item in a nested list', () => {
    const markdown = ['- [ ] parent', '  - plain first', '  - [ ] checkbox after'].join('\n')

    expect(markdownManager.parse(markdown)).toEqual({
      type: 'doc',
      content: [
        {
          type: 'taskList',
          content: [
            taskItem(
              'parent',
              { type: 'bulletList', content: [listItem('plain first')] },
              { type: 'taskList', content: [taskItem('checkbox after')] },
            ),
          ],
        },
      ],
    })
  })

  it('still parses a purely-checkbox nested list as a single task list', () => {
    const markdown = ['- [ ] parent', '  - [ ] child 1', '  - [x] child 2'].join('\n')

    expect(markdownManager.parse(markdown)).toEqual({
      type: 'doc',
      content: [
        {
          type: 'taskList',
          content: [
            taskItem('parent', {
              type: 'taskList',
              content: [
                taskItem('child 1'),
                {
                  type: 'taskItem',
                  attrs: { checked: true },
                  content: [paragraph('child 2')],
                },
              ],
            }),
          ],
        },
      ],
    })
  })

  it('round-trips the mixed nested list back to the original markdown', () => {
    const markdown = ['- [ ] parent', '  - [ ] checkbox child', '  - plain child'].join('\n')

    const json = markdownManager.parse(markdown)
    expect(markdownManager.serialize(json).trim()).toBe(markdown)
  })
})
