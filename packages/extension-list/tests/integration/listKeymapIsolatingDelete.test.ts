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

  it('joins the following paragraph in the same frame and leaves the next frame alone', () => {
    editor = new Editor({
      extensions: [Page, Paragraph, Text, Frame, OrderedList, ListItem, ListKeymap],
      content: isolatingFramesContent,
    })

    editor.commands.setTextSelection(findTextEnd(editor, 'hello'))

    expect(dispatchDelete(editor)).toBe(true)

    const frames = editor.getJSON().content
    const first = JSON.stringify(frames?.[0])
    const second = JSON.stringify(frames?.[1])

    expect(frames).toHaveLength(2)
    expect(first).toContain('hello')
    expect(first).toContain('world')
    expect(first).not.toContain('whoops')
    expect(second).toContain('whoops')
    expect(second).not.toContain('world')
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
