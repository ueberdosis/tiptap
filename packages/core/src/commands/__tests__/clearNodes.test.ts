import { Editor } from '@tiptap/core'
import BulletList from '@tiptap/extension-bullet-list'
import Document from '@tiptap/extension-document'
import { ListItem } from '@tiptap/extension-list'
import OrderedList from '@tiptap/extension-ordered-list'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { afterEach, describe, expect, it } from 'vite-plus/test'

let editor: Editor | null = null

const createEditor = (content: string) => {
  editor = new Editor({
    extensions: [Document, Paragraph, Text, BulletList, OrderedList, ListItem],
    content,
  })

  return editor
}

afterEach(() => {
  editor?.destroy()
  editor = null
})

describe('clearNodes', () => {
  it('flattens a list that is only one level deep', () => {
    const editor = createEditor('<ul><li><p>one</p></li><li><p>two</p></li></ul>')

    editor.commands.selectAll()
    editor.commands.clearNodes()

    expect(editor.getHTML()).toBe('<p>one</p><p>two</p>')
  })

  it('flattens every level of a nested list', () => {
    // `listItem` is `paragraph block*`, so the item holding the nested list
    // cannot be lifted until that list has been lifted out of it. A single
    // pass leaves it wrapped.
    const editor = createEditor(
      '<ul><li><p>one</p><ul><li><p>one.one</p></li></ul></li><li><p>two</p></li></ul>',
    )

    editor.commands.selectAll()
    editor.commands.clearNodes()

    expect(editor.getHTML()).toBe('<p>one</p><p>one.one</p><p>two</p>')
  })

  it('flattens a three-level list', () => {
    const editor = createEditor(
      '<ul><li><p>one</p><ul><li><p>one.one</p><ul><li><p>one.one.one</p></li></ul></li></ul></li></ul>',
    )

    editor.commands.selectAll()
    editor.commands.clearNodes()

    expect(editor.getHTML()).toBe('<p>one</p><p>one.one</p><p>one.one.one</p>')
  })

  it('can be chained with another node command without throwing', () => {
    const editor = createEditor(
      '<ul><li><p>one</p><ul><li><p>one.one</p></li></ul></li><li><p>two</p></li></ul>',
    )

    editor.commands.selectAll()

    expect(() => editor.chain().focus().clearNodes().toggleOrderedList().run()).not.toThrow()
    expect(editor.getHTML()).toBe(
      '<ol><li><p>one</p></li><li><p>one.one</p></li><li><p>two</p></li></ol>',
    )
  })

  it('flattens a deeply nested list', () => {
    const depth = 30
    const open = '<ul><li><p>item</p>'.repeat(depth)
    const close = '</li></ul>'.repeat(depth)
    const editor = createEditor(open + close)

    editor.commands.selectAll()
    editor.commands.clearNodes()

    expect(editor.getHTML()).toBe('<p>item</p>'.repeat(depth))
  })

  it('runs correctly after another node command in the same chain', () => {
    const editor = createEditor('<p>one</p><p>two</p>')

    editor.commands.selectAll()

    // The transaction already carries steps by the time clearNodes runs, so
    // the selection no longer points into the document it started from.
    expect(() => editor.chain().focus().toggleBulletList().clearNodes().run()).not.toThrow()
    expect(editor.getHTML()).toBe('<p>one</p><p>two</p>')
  })

  it('only clears the selected range', () => {
    const editor = createEditor(
      '<ul><li><p>keep</p></li></ul><p>middle</p><ul><li><p>clear</p></li></ul>',
    )

    // Select across the last list item only, leaving the first list alone.
    let from = 0
    let to = 0
    editor.state.doc.descendants((node, pos) => {
      if (node.isText && node.text === 'clear') {
        from = pos
        to = pos + node.nodeSize
      }
    })

    editor.commands.setTextSelection({ from, to })
    expect(editor.state.selection.empty).toBe(false)

    editor.commands.clearNodes()

    expect(editor.getHTML()).toBe('<ul><li><p>keep</p></li></ul><p>middle</p><p>clear</p>')
  })

  it('leaves plain paragraphs untouched', () => {
    const editor = createEditor('<p>one</p><p>two</p>')

    editor.commands.selectAll()
    editor.commands.clearNodes()

    expect(editor.getHTML()).toBe('<p>one</p><p>two</p>')
  })
})
