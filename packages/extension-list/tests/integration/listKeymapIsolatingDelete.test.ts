import { Editor, Node } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { afterEach, describe, expect, it } from 'vite-plus/test'

import { ListItem, ListKeymap, OrderedList } from '../../src/index.js'

const Frame = Node.create({
  name: 'frame',
  content: 'block+',
  isolating: true,
  parseHTML() {
    return [{ tag: 'div[data-frame]' }]
  },
  renderHTML() {
    return ['div', { 'data-frame': '' }, 0]
  },
})

const Page = Document.extend({
  content: 'frame+',
})

const isolatingFramesContent = {
  type: 'doc',
  content: [
    {
      type: 'frame',
      content: [
        {
          type: 'orderedList',
          content: [
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'hello' }] }],
            },
          ],
        },
        { type: 'paragraph', content: [{ type: 'text', text: 'world' }] },
      ],
    },
    {
      type: 'frame',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'whoops' }] }],
    },
  ],
}

function findTextEnd(editor: Editor, text: string) {
  let position: number | null = null

  editor.state.doc.descendants((node, pos) => {
    if (position !== null) {
      return false
    }

    if (node.isText && node.text === text) {
      position = pos + node.text.length
    }
  })

  if (position === null) {
    throw new Error(`Could not find text position for "${text}"`)
  }

  return position
}

function dispatchDelete(editor: Editor) {
  return editor.view.someProp('handleKeyDown', f =>
    f(
      editor.view,
      new KeyboardEvent('keydown', { key: 'Delete', bubbles: true, cancelable: true }),
    ),
  )
}

describe('ListKeymap Delete across isolating frames (#8321)', () => {
  let editor: Editor

  afterEach(() => {
    editor?.destroy()
  })

  it('moves the following paragraph into the list, then joins it without changing the next frame', () => {
    editor = new Editor({
      extensions: [Page, Paragraph, Text, Frame, OrderedList, ListItem, ListKeymap],
      content: isolatingFramesContent,
    })

    editor.commands.setTextSelection(findTextEnd(editor, 'hello'))

    expect(dispatchDelete(editor)).toBe(true)

    const firstFrameAfterDelete = editor.state.doc.child(0)
    const listAfterDelete = firstFrameAfterDelete.child(0)

    expect(firstFrameAfterDelete.childCount).toBe(1)
    expect(listAfterDelete.type.name).toBe('orderedList')
    expect(listAfterDelete.childCount).toBe(2)
    expect(listAfterDelete.child(0).textContent).toBe('hello')
    expect(listAfterDelete.child(1).textContent).toBe('world')
    expect(editor.state.doc.childCount).toBe(2)
    expect(editor.state.doc.child(1).textContent).toBe('whoops')

    expect(dispatchDelete(editor)).toBe(true)

    const doc = editor.state.doc
    const firstFrame = doc.child(0)
    const orderedList = firstFrame.child(0)

    expect(doc.childCount).toBe(2)
    expect(firstFrame.childCount).toBe(1)
    expect(orderedList.type.name).toBe('orderedList')
    expect(orderedList.childCount).toBe(1)
    expect(orderedList.child(0).type.name).toBe('listItem')
    expect(orderedList.child(0).textContent).toBe('helloworld')
    expect(doc.child(1).textContent).toBe('whoops')
  })

  it('still joins two list items inside the same isolating frame', () => {
    editor = new Editor({
      extensions: [Page, Paragraph, Text, Frame, OrderedList, ListItem, ListKeymap],
      content: {
        type: 'doc',
        content: [
          {
            type: 'frame',
            content: [
              {
                type: 'orderedList',
                content: [
                  {
                    type: 'listItem',
                    content: [{ type: 'paragraph', content: [{ type: 'text', text: 'hello' }] }],
                  },
                  {
                    type: 'listItem',
                    content: [{ type: 'paragraph', content: [{ type: 'text', text: 'next' }] }],
                  },
                ],
              },
            ],
          },
          {
            type: 'frame',
            content: [{ type: 'paragraph', content: [{ type: 'text', text: 'whoops' }] }],
          },
        ],
      },
    })

    editor.commands.setTextSelection(findTextEnd(editor, 'hello'))

    expect(dispatchDelete(editor)).toBe(true)

    const frames = editor.getJSON().content

    expect(frames).toHaveLength(2)
    expect(JSON.stringify(frames?.[0])).toContain('hellonext')
    expect(JSON.stringify(frames?.[1])).toContain('whoops')
  })
})
