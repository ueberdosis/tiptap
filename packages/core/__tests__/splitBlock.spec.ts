import { Editor, Mark, Node } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { afterEach, describe, expect, it } from 'vite-plus/test'

const Bold = Mark.create({
  name: 'bold',
  parseHTML() {
    return [{ tag: 'strong' }]
  },
  renderHTML() {
    return ['strong', 0]
  },
})

const InlineTextNode = Node.create({
  name: 'inlineTextNode',
  group: 'inline',
  inline: true,
  content: 'text*',
  renderHTML() {
    return ['span', { 'data-inline-text': '' }, 0]
  },
  parseHTML() {
    return [{ tag: 'span[data-inline-text]' }]
  },
})

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

let editor: Editor

const createEditor = (content: string) => {
  editor = new Editor({
    extensions: [Document, Paragraph, Text, Callout],
    content,
  })

  return editor
}

afterEach(() => {
  editor.destroy()
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

  it('deletes the selection and splits when the selection starts at the start of a block and ends in another block', () => {
    const editor = createEditor('<p>one</p><p>two</p>')

    editor.commands.setTextSelection({ from: 1, to: 6 })

    expect(editor.commands.splitBlock()).toBe(true)
    expect(editor.getHTML()).toBe('<p></p><p>two</p>')
  })

  it('deletes the selection and splits across three paragraphs', () => {
    const editor = createEditor('<p>a</p><p>b</p><p>c</p>')

    editor.commands.setTextSelection({ from: 1, to: 7 })

    expect(editor.commands.keyboardShortcut('Enter')).toBe(true)
    expect(editor.getHTML()).toBe('<p></p><p>c</p>')
  })

  it('deletes the selection and splits when select-all is active', () => {
    const editor = createEditor('<p>one</p><p>two</p>')

    editor.commands.selectAll()

    expect(editor.commands.keyboardShortcut('Enter')).toBe(true)
    expect(editor.getHTML()).toBe('<p></p><p></p>')
  })

  it('returns false and leaves the document unchanged when the split position is invalid after deleting the selection', () => {
    const SingleParagraphBox = Node.create({
      name: 'singleParagraphBox',
      group: 'block',
      content: 'paragraph',
      isolating: true,
      renderHTML() {
        return ['div', { 'data-single-box': '' }, 0]
      },
      parseHTML() {
        return [{ tag: 'div[data-single-box]' }]
      },
    })
    editor = new Editor({
      extensions: [Document, Paragraph, Text, SingleParagraphBox],
      content: '<p>one</p><div data-single-box><p>two</p></div>',
    })
    const before = editor.getHTML()

    editor.commands.setTextSelection({ from: 1, to: 7 })

    expect(editor.commands.splitBlock()).toBe(false)
    expect(editor.can().splitBlock()).toBe(false)
    expect(editor.getHTML()).toBe(before)
  })

  it('does not throw when the selection spans from a paragraph into an isolating node', () => {
    const editor = createEditor('<p>one</p><div data-callout><p>two</p></div>')

    editor.commands.setTextSelection({ from: 1, to: 6 })

    expect(() => editor.commands.splitBlock()).not.toThrow()
    expect(editor.getHTML()).toBe('<div data-callout=""><p></p><p>two</p></div>')
  })

  it('deletes and splits when pressing Enter with a selection spanning block boundaries', () => {
    const editor = createEditor('<p>one</p><p>two</p>')

    editor.commands.setTextSelection({ from: 1, to: 6 })

    expect(() => editor.commands.keyboardShortcut('Enter')).not.toThrow()
    expect(editor.getHTML()).toBe('<p></p><p>two</p>')
  })

  it('can().splitBlock() returns true without mutating the document when cross-block split succeeds', () => {
    const editor = createEditor('<p>one</p><p>two</p>')

    editor.commands.setTextSelection({ from: 1, to: 6 })

    expect(editor.can().splitBlock()).toBe(true)
    expect(editor.getHTML()).toBe('<p>one</p><p>two</p>')
  })

  it('removes an emptied inline text node and splits cleanly when its text is selected', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, InlineTextNode],
      content: '<p>before <span data-inline-text>test</span> after</p>',
    })

    editor.commands.setTextSelection({ from: 9, to: 13 })

    expect(editor.commands.splitBlock()).toBe(true)
    expect(editor.getHTML()).toBe('<p>before </p><p> after</p>')
  })

  it('keeps splittable marks when deleting a cross-block selection starting in marked text', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, Bold],
      content: '<p><strong>one</strong></p><p>two</p>',
    })

    editor.commands.setTextSelection({ from: 1, to: 6 })

    expect(editor.commands.splitBlock({ keepMarks: true })).toBe(true)
    expect(editor.state.storedMarks?.map(mark => mark.type.name)).toEqual(['bold'])
  })

  it('clears marks when splitting an AllSelection over marked text', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, Bold],
      content: '<p><strong>one</strong></p><p>two</p>',
    })

    editor.commands.selectAll()

    expect(editor.commands.splitBlock({ keepMarks: true })).toBe(true)
    expect(editor.getHTML()).toBe('<p></p><p></p>')
    expect(editor.state.storedMarks).toBeNull()
  })
})
