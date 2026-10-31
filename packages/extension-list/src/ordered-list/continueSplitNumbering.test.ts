import type { JSONContent } from '@tiptap/core'
import { Editor, Extension } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { history, redo, undo, undoDepth } from '@tiptap/pm/history'
import { liftListItem } from '@tiptap/pm/schema-list'
import type { Transaction } from '@tiptap/pm/state'
import { afterEach, describe, expect, it } from 'vite-plus/test'

import { ListItem, OrderedList } from '../index.js'

const History = Extension.create({
  name: 'history',

  addProseMirrorPlugins() {
    return [history()]
  },
})

type ListSnapshot = {
  start: number
  type: string | null
  items: string[]
}

function item(text: string): JSONContent {
  return {
    type: 'listItem',
    content: [
      {
        type: 'paragraph',
        content: text ? [{ type: 'text', text }] : [],
      },
    ],
  }
}

function orderedList(texts: string[], attrs?: Record<string, unknown>): JSONContent {
  return {
    type: 'orderedList',
    attrs,
    content: texts.map(item),
  }
}

function createEditor(
  content: JSONContent,
  options?: { continueNumberingOnSplit?: boolean; history?: boolean },
): Editor {
  const orderedListExtension =
    options?.continueNumberingOnSplit === false
      ? OrderedList.configure({ continueNumberingOnSplit: false })
      : OrderedList

  return new Editor({
    extensions: [
      Document,
      Paragraph,
      Text,
      orderedListExtension,
      ListItem,
      ...(options?.history ? [History] : []),
    ],
    content,
  })
}

function readOrderedLists(editor: Editor): ListSnapshot[] {
  const lists: ListSnapshot[] = []

  editor.state.doc.descendants(node => {
    if (node.type.name !== 'orderedList') {
      return
    }

    const items: string[] = []

    node.forEach(child => {
      items.push(child.textContent)
    })

    lists.push({
      start: node.attrs.start,
      type: node.attrs.type ?? null,
      items,
    })

    return false
  })

  return lists
}

function selectText(editor: Editor, text: string) {
  let position: number | null = null

  editor.state.doc.descendants((node, pos) => {
    if (position !== null) {
      return false
    }

    if (node.isText && node.text === text) {
      position = pos + text.length
      return false
    }
  })

  if (position === null) {
    throw new Error(`Could not find "${text}"`)
  }

  editor.commands.setTextSelection(position)
}

function liftText(editor: Editor, text: string) {
  selectText(editor, text)
  expect(editor.commands.liftListItem('listItem')).toBe(true)
}

function splitAndEditTrailingList(
  editor: Editor,
  text: string,
  edit: (transaction: Transaction, position: number) => void,
) {
  selectText(editor, text)

  const lifted = liftListItem(editor.schema.nodes.listItem)(editor.state, transaction => {
    let trailing: number | null = null

    transaction.doc.descendants((node, pos) => {
      if (node.type.name !== 'orderedList') {
        return
      }

      trailing = pos
      return false
    })

    if (trailing == null) {
      throw new Error('Expected a trailing ordered list')
    }

    edit(transaction, trailing)
    editor.view.dispatch(transaction)
  })

  expect(lifted).toBe(true)
}

function boundaryBetweenOrderedLists(editor: Editor): number {
  const { doc } = editor.state
  let offset = 0

  for (let index = 0; index < doc.childCount - 1; index += 1) {
    const child = doc.child(index)

    offset += child.nodeSize

    if (child.type.name === 'orderedList' && doc.child(index + 1).type.name === 'orderedList') {
      return offset
    }
  }

  throw new Error('Could not find adjacent ordered lists')
}

function selectEmptyParagraph(editor: Editor) {
  let position: number | null = null

  editor.state.doc.descendants((node, pos) => {
    if (position !== null) {
      return false
    }

    if (node.type.name === 'paragraph' && node.content.size === 0) {
      position = pos + 1
      return false
    }
  })

  if (position === null) {
    throw new Error('Could not find an empty paragraph')
  }

  editor.commands.setTextSelection(position)
}

function typeText(editor: Editor, text: string) {
  for (const char of text) {
    const from = editor.state.selection.from
    const handled = editor.view.someProp('handleTextInput', handler =>
      handler(editor.view, from, from, char),
    )

    if (!handled) {
      editor.view.dispatch(editor.state.tr.insertText(char))
    }
  }
}

describe('continueSplitNumbering', () => {
  let editor: Editor

  afterEach(() => {
    editor?.destroy()
  })

  it('keeps numbering when the middle item is lifted', () => {
    editor = createEditor({
      type: 'doc',
      content: [orderedList(['One', 'Two', 'Three', 'Four', 'Five'])],
    })

    liftText(editor, 'Three')

    expect(readOrderedLists(editor)).toEqual([
      { start: 1, type: null, items: ['One', 'Two'] },
      { start: 4, type: null, items: ['Four', 'Five'] },
    ])
  })

  it('continues numbering across a second split', () => {
    editor = createEditor({
      type: 'doc',
      content: [orderedList(['One', 'Two', 'Three', 'Four', 'Five', 'Six'])],
    })

    liftText(editor, 'Three')
    liftText(editor, 'Five')

    expect(readOrderedLists(editor)).toEqual([
      { start: 1, type: null, items: ['One', 'Two'] },
      { start: 4, type: null, items: ['Four'] },
      { start: 6, type: null, items: ['Six'] },
    ])
  })

  it('continues from a custom start', () => {
    editor = createEditor({
      type: 'doc',
      content: [orderedList(['One', 'Two', 'Three', 'Four', 'Five'], { start: 5 })],
    })

    liftText(editor, 'Three')

    expect(readOrderedLists(editor)).toEqual([
      { start: 5, type: null, items: ['One', 'Two'] },
      { start: 8, type: null, items: ['Four', 'Five'] },
    ])
  })

  it('keeps a typed list at 1', () => {
    editor = createEditor({
      type: 'doc',
      content: [orderedList(['One', 'Two']), { type: 'paragraph' }],
    })

    selectEmptyParagraph(editor)
    typeText(editor, '1. ')

    expect(readOrderedLists(editor)).toEqual([
      { start: 1, type: null, items: ['One', 'Two'] },
      { start: 1, type: null, items: [''] },
    ])
  })

  it('does not continue numbering when the option is off', () => {
    editor = createEditor(
      {
        type: 'doc',
        content: [orderedList(['One', 'Two', 'Three', 'Four', 'Five'])],
      },
      { continueNumberingOnSplit: false },
    )

    liftText(editor, 'Three')

    expect(readOrderedLists(editor)).toEqual([
      { start: 1, type: null, items: ['One', 'Two'] },
      { start: 1, type: null, items: ['Four', 'Five'] },
    ])
  })

  it.each(['a', 'I'])('continues a %s list with the same type', type => {
    editor = createEditor({
      type: 'doc',
      content: [orderedList(['One', 'Two', 'Three', 'Four', 'Five'], { type })],
    })

    liftText(editor, 'Three')

    expect(readOrderedLists(editor)).toEqual([
      { start: 1, type, items: ['One', 'Two'] },
      { start: 4, type, items: ['Four', 'Five'] },
    ])
  })

  it('restores the original list in one undo', () => {
    editor = createEditor(
      {
        type: 'doc',
        content: [orderedList(['One', 'Two', 'Three', 'Four', 'Five'])],
      },
      { history: true },
    )

    const before = editor.getJSON()

    liftText(editor, 'Three')

    expect(readOrderedLists(editor)[1]?.start).toBe(4)
    expect(undoDepth(editor.state)).toBe(1)

    undo(editor.state, editor.view.dispatch)

    expect(editor.getJSON()).toEqual(before)
    expect(undoDepth(editor.state)).toBe(0)
  })

  it('restores numbering when undoing a join of independent lists', () => {
    editor = createEditor(
      {
        type: 'doc',
        content: [orderedList(['One', 'Two']), orderedList(['Three', 'Four'])],
      },
      { history: true },
    )

    const before = editor.getJSON()

    editor.view.dispatch(editor.state.tr.join(boundaryBetweenOrderedLists(editor)))

    expect(readOrderedLists(editor)).toEqual([
      { start: 1, type: null, items: ['One', 'Two', 'Three', 'Four'] },
    ])

    undo(editor.state, editor.view.dispatch)

    expect(editor.getJSON()).toEqual(before)

    redo(editor.state, editor.view.dispatch)

    expect(readOrderedLists(editor)).toEqual([
      { start: 1, type: null, items: ['One', 'Two', 'Three', 'Four'] },
    ])
  })

  it('counts a lifted item with two paragraphs once', () => {
    editor = createEditor({
      type: 'doc',
      content: [
        {
          type: 'orderedList',
          content: [
            item('One'),
            item('Two'),
            {
              type: 'listItem',
              content: [
                { type: 'paragraph', content: [{ type: 'text', text: 'Three' }] },
                { type: 'paragraph', content: [{ type: 'text', text: 'More' }] },
              ],
            },
            item('Four'),
            item('Five'),
          ],
        },
      ],
    })

    liftText(editor, 'Three')

    expect(readOrderedLists(editor)).toEqual([
      { start: 1, type: null, items: ['One', 'Two'] },
      { start: 4, type: null, items: ['Four', 'Five'] },
    ])
  })

  it('does not renumber a following list that was created separately', () => {
    editor = createEditor({
      type: 'doc',
      content: [
        orderedList(['One', 'Two']),
        { type: 'paragraph', content: [{ type: 'text', text: 'Gap' }] },
        orderedList(['Three', 'Four']),
      ],
    })

    selectText(editor, 'Three')
    typeText(editor, '!')

    expect(readOrderedLists(editor)[1]).toEqual({
      start: 1,
      type: null,
      items: ['Three!', 'Four'],
    })
  })

  it('continues numbering when enter lifts an empty item', () => {
    editor = createEditor({
      type: 'doc',
      content: [orderedList(['One', 'Two', '', 'Four', 'Five'])],
    })

    selectEmptyParagraph(editor)
    editor.view.someProp('handleKeyDown', handler =>
      handler(editor.view, new KeyboardEvent('keydown', { key: 'Enter' })),
    )

    expect(readOrderedLists(editor)).toEqual([
      { start: 1, type: null, items: ['One', 'Two'] },
      { start: 4, type: null, items: ['Four', 'Five'] },
    ])
  })

  it('keeps an explicit start of 1 set with setNodeMarkup while splitting', () => {
    editor = createEditor({
      type: 'doc',
      content: [orderedList(['One', 'Two', 'Three', 'Four', 'Five'])],
    })

    splitAndEditTrailingList(editor, 'Three', (transaction, position) => {
      const node = transaction.doc.nodeAt(position)

      if (!node) {
        throw new Error('Expected an ordered list')
      }

      transaction.setNodeMarkup(position, undefined, {
        ...node.attrs,
        start: 1,
      })
    })

    expect(readOrderedLists(editor)).toEqual([
      { start: 1, type: null, items: ['One', 'Two'] },
      { start: 1, type: null, items: ['Four', 'Five'] },
    ])
  })

  it('keeps an explicit start attribute set while splitting', () => {
    editor = createEditor({
      type: 'doc',
      content: [orderedList(['One', 'Two', 'Three', 'Four', 'Five'])],
    })

    splitAndEditTrailingList(editor, 'Three', (transaction, position) => {
      transaction.setNodeAttribute(position, 'start', 1)
    })

    expect(readOrderedLists(editor)).toEqual([
      { start: 1, type: null, items: ['One', 'Two'] },
      { start: 1, type: null, items: ['Four', 'Five'] },
    ])
  })

  it('keeps an explicit start of 1 from the splitting command chain', () => {
    editor = createEditor({
      type: 'doc',
      content: [orderedList(['One', 'Two', 'Three', 'Four', 'Five'])],
    })

    selectText(editor, 'Three')

    const updated = editor
      .chain()
      .liftListItem('listItem')
      .command(({ tr, commands }) => {
        let inside: number | null = null

        tr.doc.descendants((node, pos) => {
          if (inside !== null) {
            return false
          }

          if (node.isText && node.text === 'Four') {
            inside = pos + 1
            return false
          }
        })

        if (inside === null) {
          return false
        }

        return commands.setTextSelection(inside)
      })
      .updateAttributes('orderedList', { start: 1 })
      .run()

    expect(updated).toBe(true)
    expect(readOrderedLists(editor)).toEqual([
      { start: 1, type: null, items: ['One', 'Two'] },
      { start: 1, type: null, items: ['Four', 'Five'] },
    ])
  })

  it('counts an item inserted in the same transaction as the split', () => {
    editor = createEditor({
      type: 'doc',
      content: [orderedList(['One', 'Two', 'Three', 'Four', 'Five'])],
    })

    selectText(editor, 'Three')

    const lifted = liftListItem(editor.schema.nodes.listItem)(editor.state, transaction => {
      transaction.insert(1, editor.schema.nodeFromJSON(item('Zero')))
      editor.view.dispatch(transaction)
    })

    expect(lifted).toBe(true)
    expect(readOrderedLists(editor)).toEqual([
      { start: 1, type: null, items: ['Zero', 'One', 'Two'] },
      { start: 5, type: null, items: ['Four', 'Five'] },
    ])
  })

  it('counts an item removed in the same transaction as the split', () => {
    editor = createEditor({
      type: 'doc',
      content: [orderedList(['One', 'Two', 'Three', 'Four', 'Five'])],
    })

    selectText(editor, 'Three')

    const lifted = liftListItem(editor.schema.nodes.listItem)(editor.state, transaction => {
      const first = transaction.doc.firstChild?.firstChild

      if (first) {
        transaction.delete(1, 1 + first.nodeSize)
      }

      editor.view.dispatch(transaction)
    })

    expect(lifted).toBe(true)
    expect(readOrderedLists(editor)).toEqual([
      { start: 1, type: null, items: ['Two'] },
      { start: 3, type: null, items: ['Four', 'Five'] },
    ])
  })

  it('ignores a collaboration transaction', () => {
    editor = createEditor({
      type: 'doc',
      content: [orderedList(['One', 'Two', 'Three', 'Four', 'Five'])],
    })

    selectText(editor, 'Three')

    const lifted = liftListItem(editor.schema.nodes.listItem)(editor.state, transaction => {
      transaction.setMeta('y-sync$', { isChangeOrigin: true })
      editor.view.dispatch(transaction)
    })

    expect(lifted).toBe(true)
    expect(readOrderedLists(editor)[1]?.start).toBe(1)
  })
})
