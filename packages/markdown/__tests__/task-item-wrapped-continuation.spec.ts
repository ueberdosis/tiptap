import { Document } from '@tiptap/extension-document'
import { BulletList, ListItem, OrderedList, TaskItem, TaskList } from '@tiptap/extension-list'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Text } from '@tiptap/extension-text'
import { describe, expect, it } from 'vitest'

import { MarkdownManager } from '../src/MarkdownManager.js'

/**
 * Regression tests for #7909.
 *
 * A task-item continuation line aligned under the marker's text column (e.g.
 * six spaces for `- [ ] `) was dedented by a fixed amount that left >= 4
 * residual spaces, so `marked` parsed it as an indented code block — which
 * cannot interrupt a paragraph, silently dropping the line. Such soft-wrapped
 * lines should merge into the item's paragraph, matching CommonMark renderers.
 */
describe('Task item wrapped continuation parsing (#7909)', () => {
  const mm = new MarkdownManager({
    extensions: [Document, Paragraph, Text, BulletList, OrderedList, ListItem, TaskList, TaskItem],
  })

  it('merges a continuation aligned under the checkbox text column into one paragraph', () => {
    const input =
      '- [ ] Agent tab renders the composer in all states (no session\n' +
      '      empty transcript + composer).'

    expect(mm.parse(input)).toMatchObject({
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
                      text: 'Agent tab renders the composer in all states (no session empty transcript + composer).',
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

  it('merges multiple wrapped continuation lines into one paragraph', () => {
    const input = '- [ ] first line\n      second line\n      third line'
    const json = mm.parse(input)
    const item = json.content![0].content![0]
    expect(item.content).toHaveLength(1)
    expect(item.content![0]).toMatchObject({
      type: 'paragraph',
      content: [{ type: 'text', text: 'first line second line third line' }],
    })
  })

  it('still keeps a genuinely nested task item as a nested list, not a continuation', () => {
    const input = '- [ ] parent\n  - [ ] child'
    const parent = mm.parse(input).content![0].content![0]
    // parent paragraph + a nested taskList (not merged into the paragraph text)
    expect(parent.content![0]).toMatchObject({
      type: 'paragraph',
      content: [{ type: 'text', text: 'parent' }],
    })
    expect(parent.content![1].type).toBe('taskList')
    expect(parent.content![1].content![0].content![0].content![0].text).toBe('child')
  })
})
