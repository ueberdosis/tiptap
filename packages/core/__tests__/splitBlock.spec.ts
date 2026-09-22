import { Editor } from '@tiptap/core'
import BulletList from '@tiptap/extension-bullet-list'
import Document from '@tiptap/extension-document'
import ListItem from '@tiptap/extension-list-item'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { afterEach, describe, expect, it } from 'vitest'

describe('splitBlock', () => {
  let editor: Editor

  afterEach(() => {
    editor?.destroy()
  })

  it('does not throw when splitting across list item boundaries (cross-boundary selection)', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, BulletList, ListItem],
      content: {
        type: 'doc',
        content: [
          {
            type: 'bulletList',
            content: [
              {
                type: 'listItem',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'first item' }] }],
              },
              {
                type: 'listItem',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'second item' }] }],
              },
            ],
          },
        ],
      },
    })

    // Select from inside first list item to inside second list item (cross-boundary)
    const { doc } = editor.state
    const firstTextPos = 3 // inside "first item"
    const secondTextPos = doc.content.size - 4 // inside "second item"

    editor.commands.setTextSelection({ from: firstTextPos, to: secondTextPos })

    // This should not throw "TransformError: Inserted content deeper than insertion position"
    expect(() => editor.commands.splitBlock()).not.toThrow()
  })

  it('splits a normal paragraph without error', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text],
      content: '<p>hello world</p>',
    })

    editor.commands.setTextSelection(5)

    expect(() => editor.commands.splitBlock()).not.toThrow()
    expect(editor.state.doc.childCount).toBe(2)
  })
})
