import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { describe, expect, it } from 'vite-plus/test'

import { Editor } from '../Editor.js'
import { Node } from '../Node.js'

const Wrapper = Node.create({
  name: 'wrapper',
  group: 'block',
  content: 'block+',
  parseHTML() {
    return [{ tag: 'div[data-wrapper]' }]
  },
  renderHTML() {
    return ['div', { 'data-wrapper': '' }, 0]
  },
})

const Frame = Node.create({
  name: 'frame',
  group: 'block',
  content: 'block+',
  isolating: true,
  parseHTML() {
    return [{ tag: 'div[data-frame]' }]
  },
  renderHTML() {
    return ['div', { 'data-frame': '' }, 0]
  },
})

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

describe('joinItemForward', () => {
  it('joins adjacent non-isolating wrappers', () => {
    const editor = new Editor({
      extensions: [Document, Paragraph, Text, Wrapper],
      content: {
        type: 'doc',
        content: [
          {
            type: 'wrapper',
            content: [{ type: 'paragraph', content: [{ type: 'text', text: 'hello' }] }],
          },
          {
            type: 'wrapper',
            content: [{ type: 'paragraph', content: [{ type: 'text', text: 'world' }] }],
          },
        ],
      },
    })

    editor.commands.setTextSelection(findTextEnd(editor, 'hello'))

    expect(editor.commands.joinItemForward()).toBe(true)
    expect(editor.getJSON().content).toHaveLength(1)
    expect(JSON.stringify(editor.getJSON())).toContain('helloworld')

    editor.destroy()
  })

  it('does not join isolating frames', () => {
    const editor = new Editor({
      extensions: [Document, Paragraph, Text, Frame],
      content: {
        type: 'doc',
        content: [
          {
            type: 'frame',
            content: [{ type: 'paragraph', content: [{ type: 'text', text: 'hello' }] }],
          },
          {
            type: 'frame',
            content: [{ type: 'paragraph', content: [{ type: 'text', text: 'whoops' }] }],
          },
        ],
      },
    })

    editor.commands.setTextSelection(findTextEnd(editor, 'hello'))
    const before = editor.getJSON()

    expect(editor.commands.joinItemForward()).toBe(false)
    expect(editor.getJSON()).toEqual(before)
    expect(editor.getJSON().content).toHaveLength(2)

    editor.destroy()
  })
})

describe('joinItemBackward', () => {
  it('does not join isolating frames', () => {
    const editor = new Editor({
      extensions: [Document, Paragraph, Text, Frame],
      content: {
        type: 'doc',
        content: [
          {
            type: 'frame',
            content: [{ type: 'paragraph', content: [{ type: 'text', text: 'hello' }] }],
          },
          {
            type: 'frame',
            content: [{ type: 'paragraph', content: [{ type: 'text', text: 'whoops' }] }],
          },
        ],
      },
    })

    editor.commands.setTextSelection(findTextEnd(editor, 'whoops') - 'whoops'.length)
    const before = editor.getJSON()

    expect(editor.commands.joinItemBackward()).toBe(false)
    expect(editor.getJSON()).toEqual(before)

    editor.destroy()
  })
})
