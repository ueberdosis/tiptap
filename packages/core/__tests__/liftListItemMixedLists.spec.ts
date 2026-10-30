import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import { BulletList, ListItem, OrderedList, TaskItem, TaskList } from '@tiptap/extension-list'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { afterEach, describe, expect, it } from 'vitest'

const paragraph = (text: string) => ({ type: 'paragraph', content: [{ type: 'text', text }] })
const listItem = (text: string, ...children: object[]) => ({
  type: 'listItem',
  content: [paragraph(text), ...children],
})
const taskItem = (text: string, checked = false, ...children: object[]) => ({
  type: 'taskItem',
  attrs: { checked },
  content: [paragraph(text), ...children],
})
const itemTexts = (list?: {
  content?: Array<{ content?: Array<{ content?: Array<{ text?: string }> }> }>
}) => list?.content?.map(item => item.content?.[0]?.content?.[0]?.text)

function findTextStart(editor: Editor, text: string) {
  let position: number | null = null

  editor.state.doc.descendants((node, pos) => {
    if (position !== null) {
      return false
    }

    if (node.isText && node.text === text) {
      position = pos
    }
  })

  if (position === null) {
    throw new Error(`Could not find text position for "${text}"`)
  }

  return position
}

describe('liftListItem across list types', () => {
  let editor: Editor

  afterEach(() => {
    editor?.destroy()
  })

  const createEditor = (content: object) => {
    editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        BulletList,
        OrderedList,
        ListItem,
        TaskList,
        TaskItem.configure({ nested: true }),
      ],
      content,
    })

    return editor
  }

  it('lifts a task item into the surrounding ordered list as a list item', () => {
    createEditor({
      type: 'doc',
      content: [
        {
          type: 'orderedList',
          content: [
            listItem('First', { type: 'taskList', content: [taskItem('task')] }),
            listItem('Second'),
          ],
        },
      ],
    })

    editor.commands.setTextSelection(findTextStart(editor, 'task') + 2)

    expect(editor.commands.liftListItem('taskItem')).toBe(true)

    const orderedList = editor.getJSON().content?.[0]

    expect(orderedList?.content?.map(item => item.type)).toEqual([
      'listItem',
      'listItem',
      'listItem',
    ])
    expect(itemTexts(orderedList)).toEqual(['First', 'task', 'Second'])
    expect(orderedList?.content?.[0]?.content).toHaveLength(1)

    expect(editor.state.selection.$from.parent.textContent).toBe('task')
    expect(editor.state.selection.$from.parentOffset).toBe(2)
  })

  it('carries following siblings along as a sublist of the lifted item', () => {
    createEditor({
      type: 'doc',
      content: [
        {
          type: 'orderedList',
          content: [
            listItem('First', {
              type: 'taskList',
              content: [taskItem('one'), taskItem('two', true), taskItem('three')],
            }),
          ],
        },
      ],
    })

    editor.commands.setTextSelection(findTextStart(editor, 'one'))

    expect(editor.commands.liftListItem('taskItem')).toBe(true)

    const orderedList = editor.getJSON().content?.[0]

    expect(itemTexts(orderedList)).toEqual(['First', 'one'])

    const lifted = orderedList?.content?.[1]
    const sublist = lifted?.content?.[1]

    expect(sublist?.type).toBe('taskList')
    expect(itemTexts(sublist)).toEqual(['two', 'three'])
    expect(sublist?.content?.[0]?.attrs?.checked).toBe(true)
  })

  it('merges following siblings into the lifted item’s existing sublist of the same type', () => {
    createEditor({
      type: 'doc',
      content: [
        {
          type: 'orderedList',
          content: [
            listItem('First', {
              type: 'taskList',
              content: [
                taskItem('one', false, { type: 'taskList', content: [taskItem('one-a')] }),
                taskItem('two'),
              ],
            }),
          ],
        },
      ],
    })

    editor.commands.setTextSelection(findTextStart(editor, 'one'))

    expect(editor.commands.liftListItem('taskItem')).toBe(true)

    const lifted = editor.getJSON().content?.[0]?.content?.[1]

    expect(lifted?.content?.map(node => node.type)).toEqual(['paragraph', 'taskList'])
    expect(itemTexts(lifted?.content?.[1])).toEqual(['one-a', 'two'])
  })

  it('keeps preceding siblings in place when lifting a middle item', () => {
    createEditor({
      type: 'doc',
      content: [
        {
          type: 'bulletList',
          content: [
            listItem('First', {
              type: 'taskList',
              content: [taskItem('a'), taskItem('b'), taskItem('c')],
            }),
            listItem('Second'),
          ],
        },
      ],
    })

    editor.commands.setTextSelection(findTextStart(editor, 'b'))

    expect(editor.commands.liftListItem('taskItem')).toBe(true)

    const bulletList = editor.getJSON().content?.[0]

    expect(itemTexts(bulletList)).toEqual(['First', 'b', 'Second'])
    expect(itemTexts(bulletList?.content?.[0]?.content?.[1])).toEqual(['a'])
    expect(itemTexts(bulletList?.content?.[1]?.content?.[1])).toEqual(['c'])
  })

  it('lifts every selected item when the selection spans several items', () => {
    createEditor({
      type: 'doc',
      content: [
        {
          type: 'orderedList',
          content: [
            listItem('First', {
              type: 'taskList',
              content: [taskItem('one'), taskItem('two'), taskItem('three')],
            }),
          ],
        },
      ],
    })

    editor.commands.setTextSelection({
      from: findTextStart(editor, 'one'),
      to: findTextStart(editor, 'two') + 3,
    })

    expect(editor.commands.liftListItem('taskItem')).toBe(true)

    const orderedList = editor.getJSON().content?.[0]

    expect(itemTexts(orderedList)).toEqual(['First', 'one', 'two'])
    expect(itemTexts(orderedList?.content?.[2]?.content?.[1])).toEqual(['three'])
  })

  it('keeps the default behavior inside a same-type nested list', () => {
    createEditor({
      type: 'doc',
      content: [
        {
          type: 'bulletList',
          content: [
            listItem('First', { type: 'bulletList', content: [listItem('one'), listItem('two')] }),
          ],
        },
      ],
    })

    editor.commands.setTextSelection(findTextStart(editor, 'one'))

    expect(editor.commands.liftListItem('listItem')).toBe(true)

    const bulletList = editor.getJSON().content?.[0]

    expect(itemTexts(bulletList)).toEqual(['First', 'one'])
    expect(itemTexts(bulletList?.content?.[1]?.content?.[1])).toEqual(['two'])
  })

  it('keeps the default behavior for a top-level list', () => {
    createEditor({
      type: 'doc',
      content: [{ type: 'taskList', content: [taskItem('only')] }],
    })

    editor.commands.setTextSelection(findTextStart(editor, 'only'))

    expect(editor.commands.liftListItem('taskItem')).toBe(true)
    expect(editor.getJSON().content?.map(node => node.type)).toEqual(['paragraph'])
  })

  it('inserts at the right position when chained after another step', () => {
    createEditor({
      type: 'doc',
      content: [
        {
          type: 'orderedList',
          content: [
            listItem('First', { type: 'taskList', content: [taskItem('one'), taskItem('two')] }),
          ],
        },
      ],
    })

    editor.commands.setTextSelection(findTextStart(editor, 'one') + 3)

    expect(editor.chain().insertContent('Y').liftListItem('taskItem').run()).toBe(true)

    const orderedList = editor.getJSON().content?.[0]

    expect(itemTexts(orderedList)).toEqual(['First', 'oneY'])
    expect(itemTexts(orderedList?.content?.[1]?.content?.[1])).toEqual(['two'])
  })

  it('reports availability through can()', () => {
    createEditor({
      type: 'doc',
      content: [
        {
          type: 'orderedList',
          content: [listItem('First', { type: 'taskList', content: [taskItem('task')] })],
        },
      ],
    })

    editor.commands.setTextSelection(findTextStart(editor, 'task'))

    const before = editor.getJSON()

    expect(editor.can().liftListItem('taskItem')).toBe(true)
    expect(editor.getJSON()).toEqual(before)
  })
})
