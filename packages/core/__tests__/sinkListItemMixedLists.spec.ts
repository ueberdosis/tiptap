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

describe('sinkListItem across list types', () => {
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

  it('joins the previous item’s task sublist and becomes a task item', () => {
    createEditor({
      type: 'doc',
      content: [
        {
          type: 'orderedList',
          content: [
            listItem('First', { type: 'taskList', content: [taskItem('existing')] }),
            listItem('Second'),
            listItem('Third'),
          ],
        },
      ],
    })

    editor.commands.setTextSelection(findTextStart(editor, 'Second') + 3)

    expect(editor.commands.sinkListItem('listItem')).toBe(true)

    const orderedList = editor.getJSON().content?.[0]

    expect(orderedList?.content).toHaveLength(2)

    const sublist = orderedList?.content?.[0]?.content?.[1]

    expect(sublist?.type).toBe('taskList')
    expect(sublist?.content?.map(item => item.type)).toEqual(['taskItem', 'taskItem'])
    expect(sublist?.content?.[1]?.content?.[0]?.content?.[0]?.text).toBe('Second')
    expect(orderedList?.content?.[1]?.content?.[0]?.content?.[0]?.text).toBe('Third')

    // the caret stays at the same offset inside the moved item
    expect(editor.state.selection.$from.parent.textContent).toBe('Second')
    expect(editor.state.selection.$from.parentOffset).toBe(3)
  })

  it('joins the previous item’s ordered sublist from a bullet list', () => {
    createEditor({
      type: 'doc',
      content: [
        {
          type: 'bulletList',
          content: [
            listItem('First', { type: 'orderedList', content: [listItem('one')] }),
            listItem('Second'),
          ],
        },
      ],
    })

    editor.commands.setTextSelection(findTextStart(editor, 'Second'))

    expect(editor.commands.sinkListItem('listItem')).toBe(true)

    const firstItem = editor.getJSON().content?.[0]?.content?.[0]

    // one sublist, not a second bullet sublist next to the ordered one
    expect(firstItem?.content?.map(node => node.type)).toEqual(['paragraph', 'orderedList'])
    expect(
      firstItem?.content?.[1]?.content?.map(item => item.content?.[0]?.content?.[0]?.text),
    ).toEqual(['one', 'Second'])
  })

  it('moves a checked task item into a bullet sublist as a list item', () => {
    createEditor({
      type: 'doc',
      content: [
        {
          type: 'taskList',
          content: [
            taskItem('First', false, { type: 'bulletList', content: [listItem('existing')] }),
            taskItem('Done', true),
          ],
        },
      ],
    })

    editor.commands.setTextSelection(findTextStart(editor, 'Done'))

    expect(editor.commands.sinkListItem('taskItem')).toBe(true)

    const sublist = editor.getJSON().content?.[0]?.content?.[0]?.content?.[1]

    expect(sublist?.type).toBe('bulletList')
    expect(sublist?.content?.map(item => item.type)).toEqual(['listItem', 'listItem'])
    expect(sublist?.content?.[1]?.content?.[0]?.content?.[0]?.text).toBe('Done')
  })

  it('moves every selected item when the selection spans several items', () => {
    createEditor({
      type: 'doc',
      content: [
        {
          type: 'orderedList',
          content: [
            listItem('First', { type: 'taskList', content: [taskItem('existing')] }),
            listItem('Second'),
            listItem('Third'),
            listItem('Fourth'),
          ],
        },
      ],
    })

    editor.commands.setTextSelection({
      from: findTextStart(editor, 'Second'),
      to: findTextStart(editor, 'Third') + 5,
    })

    expect(editor.commands.sinkListItem('listItem')).toBe(true)

    const orderedList = editor.getJSON().content?.[0]
    const sublist = orderedList?.content?.[0]?.content?.[1]

    expect(sublist?.content?.map(item => item.content?.[0]?.content?.[0]?.text)).toEqual([
      'existing',
      'Second',
      'Third',
    ])
    expect(orderedList?.content?.[1]?.content?.[0]?.content?.[0]?.text).toBe('Fourth')
  })

  it('keeps the default behavior when the sublist has the same list type', () => {
    createEditor({
      type: 'doc',
      content: [
        {
          type: 'bulletList',
          content: [
            listItem('First', { type: 'bulletList', content: [listItem('one')] }),
            listItem('Second'),
          ],
        },
      ],
    })

    editor.commands.setTextSelection(findTextStart(editor, 'Second'))

    expect(editor.commands.sinkListItem('listItem')).toBe(true)

    const sublist = editor.getJSON().content?.[0]?.content?.[0]?.content?.[1]

    expect(sublist?.type).toBe('bulletList')
    expect(sublist?.content?.map(item => item.content?.[0]?.content?.[0]?.text)).toEqual([
      'one',
      'Second',
    ])
  })

  it('does not run when the item cannot become the sublist item type', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, BulletList, ListItem, TaskList, TaskItem],
      content: {
        type: 'doc',
        content: [
          {
            type: 'bulletList',
            content: [
              listItem('First', { type: 'taskList', content: [taskItem('existing')] }),
              listItem('Second', { type: 'bulletList', content: [listItem('nested')] }),
            ],
          },
        ],
      },
    })

    editor.commands.setTextSelection(findTextStart(editor, 'Second'))

    // TaskItem without `nested` cannot hold the nested bullet list, so the default sink runs
    expect(editor.commands.sinkListItem('listItem')).toBe(true)

    const firstItem = editor.getJSON().content?.[0]?.content?.[0]

    expect(firstItem?.content?.map(node => node.type)).toEqual([
      'paragraph',
      'taskList',
      'bulletList',
    ])
  })

  it('inserts at the right position when chained after another step', () => {
    createEditor({
      type: 'doc',
      content: [
        {
          type: 'orderedList',
          content: [
            listItem('First', { type: 'taskList', content: [taskItem('existing')] }),
            listItem('Second'),
          ],
        },
      ],
    })

    editor.commands.setTextSelection(findTextStart(editor, 'Second') + 6)

    expect(editor.chain().insertContent('Y').sinkListItem('listItem').run()).toBe(true)

    const sublist = editor.getJSON().content?.[0]?.content?.[0]?.content?.[1]

    expect(sublist?.type).toBe('taskList')
    expect(sublist?.content?.map(item => item.content?.[0]?.content?.[0]?.text)).toEqual([
      'existing',
      'SecondY',
    ])
  })

  it('reports availability through can()', () => {
    createEditor({
      type: 'doc',
      content: [
        {
          type: 'orderedList',
          content: [
            listItem('First', { type: 'taskList', content: [taskItem('existing')] }),
            listItem('Second'),
          ],
        },
      ],
    })

    editor.commands.setTextSelection(findTextStart(editor, 'Second'))

    const before = editor.getJSON()

    expect(editor.can().sinkListItem('listItem')).toBe(true)
    expect(editor.getJSON()).toEqual(before)
  })
})
