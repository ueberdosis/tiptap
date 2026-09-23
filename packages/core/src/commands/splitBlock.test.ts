import { Editor, Node } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { describe, expect, it } from 'vite-plus/test'

const Callout = Node.create({
  name: 'callout',
  group: 'block',
  content: 'paragraph+',
  isolating: true,
  renderHTML() {
    return ['div', { 'data-callout': '' }, 0]
  },
  parseHTML() {
    return [
      {
        tag: 'div[data-callout]',
      },
    ]
  },
})

const createEditor = (content: string) =>
  new Editor({
    extensions: [Document, Paragraph, Text, Callout],
    content,
  })

describe('splitBlock', () => {
  it('splits a paragraph at the cursor', () => {
    const editor = createEditor('<p>onetwo</p>')

    editor.commands.setTextSelection(4)

    expect(editor.commands.splitBlock()).toBe(true)
    expect(editor.getHTML()).toBe('<p>one</p><p>two</p>')
  })

  it('deletes the selection before splitting when the blocks can merge', () => {
    const editor = createEditor('<p>one</p><p>two</p>')

    // from inside the first paragraph to inside the second one
    editor.commands.setTextSelection({ from: 3, to: 7 })

    expect(editor.commands.splitBlock()).toBe(true)
    expect(editor.getHTML()).toBe('<p>on</p><p>wo</p>')
  })

  it('does not throw when the selection starts at the start of a block and ends in another block', () => {
    const editor = createEditor('<p>one</p><p>two</p>')

    // start of the first paragraph to start of the second one: deleting this
    // selection removes the first paragraph entirely, so the mapped split
    // position resolves at depth 0
    editor.commands.setTextSelection({ from: 1, to: 6 })

    expect(() => editor.commands.splitBlock()).not.toThrow()
  })

  it('returns false and leaves the document unchanged when the split position is invalid after deleting the selection', () => {
    const editor = createEditor('<p>one</p><p>two</p>')

    editor.commands.setTextSelection({ from: 1, to: 6 })

    expect(editor.commands.splitBlock()).toBe(false)
    expect(editor.getHTML()).toBe('<p>one</p><p>two</p>')
  })

  it('does not throw when the selection spans from a paragraph into an isolating node', () => {
    const editor = createEditor('<p>one</p><div data-callout><p>two</p></div>')

    // start of the paragraph to the start of the isolating node's content:
    // deleting this selection removes the paragraph, and splitting at the
    // stale position throws "Invalid content for node callout" (same root
    // cause, different message)
    editor.commands.setTextSelection({ from: 1, to: 6 })

    expect(() => editor.commands.splitBlock()).not.toThrow()
  })

  it('does not throw when pressing Enter with a selection spanning block boundaries', () => {
    const editor = createEditor('<p>one</p><p>two</p>')

    editor.commands.setTextSelection({ from: 1, to: 6 })

    expect(() => editor.commands.keyboardShortcut('Enter')).not.toThrow()
  })

  it('can().splitBlock() returns false without mutating the document', () => {
    const editor = createEditor('<p>one</p><p>two</p>')

    editor.commands.setTextSelection({ from: 1, to: 6 })

    expect(editor.can().splitBlock()).toBe(false)
    expect(editor.getHTML()).toBe('<p>one</p><p>two</p>')
  })
})
