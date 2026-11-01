import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { describe, expect, it } from 'vite-plus/test'

import { Editor } from '../Editor.js'
import { Node } from '../Node.js'

// A list item that has to start with a paragraph. Splitting such an item in front of a
// non-paragraph child is not possible, which is what makes `canSplit` fail below.
const ListItem = Node.create({
  name: 'listItem',
  content: 'paragraph block*',
  parseHTML() {
    return [{ tag: 'li' }]
  },
  renderHTML() {
    return ['li', 0]
  },
  // Same binding as `@tiptap/extension-list`'s `ListItem`, so that pressing Enter goes through
  // the keymap extension's `commands.first([...])` with its shared transaction.
  addKeyboardShortcuts() {
    return {
      Enter: () => this.editor.commands.splitListItem(this.name),
    }
  },
})

const BulletList = Node.create({
  name: 'bulletList',
  group: 'block',
  content: 'listItem+',
  parseHTML() {
    return [{ tag: 'ul' }]
  },
  renderHTML() {
    return ['ul', 0]
  },
})

const CodeBlock = Node.create({
  name: 'codeBlock',
  group: 'block',
  content: 'text*',
  marks: '',
  code: true,
  defining: true,
  parseHTML() {
    return [{ tag: 'pre', preserveWhitespace: 'full' }]
  },
  renderHTML() {
    return ['pre', ['code', 0]]
  },
})

const createEditor = (content: string) =>
  new Editor({
    extensions: [Document, Paragraph, Text, BulletList, ListItem, CodeBlock],
    content,
  })

describe('splitListItem', () => {
  it('splits a list item at the cursor', () => {
    const editor = createEditor('<ul><li><p>onetwo</p></li></ul>')

    editor.commands.setTextSelection(6)

    expect(editor.commands.splitListItem('listItem')).toBe(true)
    expect(editor.getHTML()).toBe('<ul><li><p>one</p></li><li><p>two</p></li></ul>')
  })

  it('deletes the selection before splitting when the item can be split', () => {
    const editor = createEditor('<ul><li><p>abc</p></li></ul>')

    editor.commands.setTextSelection({ from: 4, to: 5 })

    expect(editor.commands.splitListItem('listItem')).toBe(true)
    expect(editor.getHTML()).toBe('<ul><li><p>a</p></li><li><p>c</p></li></ul>')
  })

  it('returns false and leaves the document unchanged when the item cannot be split', () => {
    // The code block is a direct child of the list item, so the item cannot be split in front
    // of it: the trailing item would start with a code block, and `listItem` requires a
    // leading paragraph. Before the fix the selection was deleted anyway, because the command
    // mutated the transaction before validating the split.
    const editor = createEditor('<ul><li><p>one</p><pre><code>abc</code></pre></li></ul>')
    const before = editor.getHTML()

    editor.commands.setTextSelection({ from: 9, to: 10 })

    expect(editor.commands.splitListItem('listItem')).toBe(false)
    expect(editor.getHTML()).toBe(before)
  })

  it('does not delete the selection when the whole content of the unsplittable block is selected', () => {
    const editor = createEditor('<ul><li><p>one</p><pre><code>abc</code></pre></li></ul>')
    const before = editor.getHTML()

    editor.commands.setTextSelection({ from: 8, to: 11 })

    expect(editor.commands.splitListItem('listItem')).toBe(false)
    expect(editor.getHTML()).toBe(before)
  })

  it('does not leak the deletion into a transaction that is dispatched by a later command', () => {
    // The command manager dispatches the shared transaction even when a command returns
    // `false`, and a chain keeps appending to it, so a failing command must not have written
    // anything to it.
    const editor = createEditor('<ul><li><p>one</p><pre><code>abc</code></pre></li></ul>')
    const before = editor.getHTML()

    editor.commands.setTextSelection({ from: 9, to: 10 })
    editor.commands.command(({ commands }) => {
      commands.splitListItem('listItem')

      return true
    })

    expect(editor.getHTML()).toBe(before)
  })

  it('does not change the document when chained with a command that succeeds', () => {
    const editor = createEditor('<ul><li><p>one</p><pre><code>abc</code></pre></li></ul>')
    const before = editor.getHTML()

    editor.commands.setTextSelection({ from: 9, to: 10 })

    expect(editor.chain().splitListItem('listItem').run()).toBe(false)
    expect(editor.getHTML()).toBe(before)
  })

  it('can().splitListItem() returns false without mutating the document', () => {
    const editor = createEditor('<ul><li><p>one</p><pre><code>abc</code></pre></li></ul>')
    const before = editor.getHTML()

    editor.commands.setTextSelection({ from: 9, to: 10 })

    expect(editor.can().splitListItem('listItem')).toBe(false)
    expect(editor.getHTML()).toBe(before)
  })

  it('does not throw when Enter is pressed with the whole content of an unsplittable block selected', () => {
    // The keymap extension runs its Enter handlers through `commands.first([...])` on one shared
    // transaction. With the deletion already applied by the failing `splitListItem`, the steps of
    // the handler that runs next no longer fit the captured transaction, and ProseMirror throws
    // `TransformError: Inconsistent open depths` out of a plain Enter keypress.
    const editor = createEditor('<ul><li><p>one</p><pre><code>abc</code></pre></li></ul>')

    editor.commands.setTextSelection({ from: 8, to: 11 })

    expect(() => editor.commands.keyboardShortcut('Enter')).not.toThrow()
  })

  it('does not throw when Enter is pressed with a selection inside an unsplittable block', () => {
    const editor = createEditor('<ul><li><p>one</p><pre><code>abc</code></pre></li></ul>')

    editor.commands.setTextSelection({ from: 9, to: 10 })

    expect(() => editor.commands.keyboardShortcut('Enter')).not.toThrow()
  })

  it('can().splitListItem() does not mutate the transaction it shares with the running command', () => {
    // `can()` inside a command hands the command the *live* transaction, so mutating `tr` in
    // the non-dispatch path is not safe either.
    const editor = createEditor('<ul><li><p>one</p><pre><code>abc</code></pre></li></ul>')
    const before = editor.getHTML()

    editor.commands.setTextSelection({ from: 9, to: 10 })
    editor.commands.command(({ can }) => {
      can().splitListItem('listItem')

      return true
    })

    expect(editor.getHTML()).toBe(before)
  })
})
