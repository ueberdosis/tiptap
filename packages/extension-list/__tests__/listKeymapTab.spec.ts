import { Editor } from '@tiptap/core'
import Blockquote from '@tiptap/extension-blockquote'
import Document from '@tiptap/extension-document'
import HorizontalRule from '@tiptap/extension-horizontal-rule'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { GapCursor } from '@tiptap/pm/gapcursor'
import { afterEach, describe, expect, it } from 'vitest'

import { BulletList, ListItem, ListKeymap, TaskItem, TaskList } from '../src/index.js'

function findNodePosition(editor: Editor, typeName: string) {
  let position: number | null = null

  editor.state.doc.descendants((node, pos) => {
    if (position !== null) {
      return false
    }

    if (node.type.name === typeName) {
      position = pos
    }
  })

  if (position === null) {
    throw new Error(`Could not find position of "${typeName}"`)
  }

  return position
}

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

function dispatchTab(editor: Editor) {
  return editor.view.someProp('handleKeyDown', f =>
    f(editor.view, new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })),
  )
}

describe('ListKeymap Tab', () => {
  let editor: Editor

  afterEach(() => {
    editor?.destroy()
  })

  it('does nothing at a gap cursor position', () => {
    editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        BulletList,
        ListItem,
        Blockquote,
        HorizontalRule,
        ListKeymap,
      ],
      content: {
        type: 'doc',
        content: [
          {
            type: 'bulletList',
            content: [
              {
                type: 'listItem',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'A' }] }],
              },
            ],
          },
          { type: 'blockquote', content: [{ type: 'horizontalRule' }] },
        ],
      },
    })

    // Place a gap cursor before the horizontal rule inside the blockquote.
    // It satisfies the empty-selection and parentOffset checks of handleTab
    // while resolving inside a non-textblock parent.
    const $gap = editor.state.doc.resolve(findNodePosition(editor, 'horizontalRule'))
    editor.view.dispatch(editor.state.tr.setSelection(new GapCursor($gap)))

    const before = editor.getJSON()

    expect(dispatchTab(editor)).toBeFalsy()
    expect(editor.getJSON()).toEqual(before)
  })

  it('sinks a paragraph only once when list types are chained', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, BulletList, ListItem, TaskList, TaskItem, ListKeymap],
      content: {
        type: 'doc',
        content: [
          {
            type: 'bulletList',
            content: [
              {
                type: 'listItem',
                content: [
                  { type: 'paragraph', content: [{ type: 'text', text: 'A' }] },
                  {
                    type: 'taskList',
                    content: [
                      {
                        type: 'taskItem',
                        attrs: { checked: false },
                        content: [{ type: 'paragraph', content: [{ type: 'text', text: 'T' }] }],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          { type: 'paragraph', content: [{ type: 'text', text: 'B' }] },
        ],
      },
    })

    editor.commands.setTextSelection(findTextStart(editor, 'B'))

    expect(dispatchTab(editor)).toBe(true)

    const listItem = editor.getJSON().content?.[0]?.content?.[0]

    // "B" becomes the last child of the list item. Without the short-circuit
    // in the Tab handler, the taskItem pass would sink it a second time into
    // the task item that now precedes it.
    expect(listItem?.content?.map(node => node.type)).toEqual([
      'paragraph',
      'taskList',
      'paragraph',
    ])
    expect(listItem?.content?.[2]?.content?.[0]?.text).toBe('B')

    const taskItem = listItem?.content?.[1]?.content?.[0]

    expect(taskItem?.content).toHaveLength(1)
    expect(taskItem?.content?.[0]?.content?.[0]?.text).toBe('T')
  })
})
