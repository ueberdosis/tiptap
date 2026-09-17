import type { JSONContent } from '@tiptap/core'
import { Editor } from '@tiptap/core'
import Bold from '@tiptap/extension-bold'
import Document from '@tiptap/extension-document'
import Link from '@tiptap/extension-link'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { UndoRedo } from '@tiptap/extensions'
import { afterEach, describe, expect, it } from 'vite-plus/test'

describe('extension-link autolink', () => {
  let editor: Editor | null = null

  const createEditor = (content: string) => {
    const editorEl = document.createElement('div')

    document.body.appendChild(editorEl)
    editor = new Editor({
      element: editorEl,
      extensions: [Document, Text, Paragraph, Link, Bold, UndoRedo],
      content,
    })
    return editor
  }

  const type = (text: string) => {
    if (!editor) {
      throw new Error('No editor')
    }
    // Insert character by character to simulate typing
    text.split('').forEach(character => {
      editor?.view.dispatch(editor.state.tr.insertText(character))
    })
  }

  const paragraphContent = (): JSONContent[] => editor?.getJSON().content?.[0].content ?? []

  const createLinkWithTrailingSpace = () => {
    const editor = createEditor('<p>click here after</p>')

    editor.commands.setTextSelection({ from: 1, to: 12 })
    editor.commands.setLink({ href: 'https://example.com' })
    return editor
  }

  afterEach(() => {
    editor?.destroy()
    editor = null
    document.body.innerHTML = ''
  })

  it('preserves linked whitespace when applying and removing formatting', () => {
    const editor = createLinkWithTrailingSpace()
    const original = editor.getJSON()

    editor.commands.setBold()

    expect(paragraphContent()[0]).toMatchObject({
      text: 'click here ',
      marks: [expect.objectContaining({ type: 'link' }), { type: 'bold' }],
    })

    editor.commands.unsetBold()

    expect(editor.getJSON()).toEqual(original)
  })

  it('restores linked whitespace when redoing setLink', () => {
    const editor = createLinkWithTrailingSpace()
    const original = editor.getJSON()

    expect(editor.commands.undo()).toBe(true)
    expect(editor.commands.redo()).toBe(true)
    expect(editor.getJSON()).toEqual(original)
  })

  it('restores linked whitespace when undoing unsetLink', () => {
    const editor = createLinkWithTrailingSpace()
    const original = editor.getJSON()

    editor.commands.unsetLink()
    const unlinked = editor.getJSON()

    expect(editor.commands.undo()).toBe(true)
    expect(editor.getJSON()).toEqual(original)
    expect(editor.commands.redo()).toBe(true)
    expect(editor.getJSON()).toEqual(unlinked)
  })

  it('restores linked whitespace when undoing text deletion', () => {
    const editor = createLinkWithTrailingSpace()
    const original = editor.getJSON()

    editor.commands.deleteRange({ from: 11, to: 12 })

    expect(editor.commands.undo()).toBe(true)
    expect(editor.getJSON()).toEqual(original)
  })

  it('keeps a typed space unlinked after undo and redo', () => {
    const editor = createEditor('<p><a href="https://example.com">https://example.com</a></p>')
    editor.commands.setTextSelection(editor.state.doc.content.size - 1)
    const original = editor.getJSON()

    type(' ')
    const withSpace = editor.getJSON()

    expect(editor.commands.undo()).toBe(true)
    expect(editor.getJSON()).toEqual(original)
    expect(editor.commands.redo()).toBe(true)
    expect(editor.getJSON()).toEqual(withSpace)
    type('hello')
    expect(paragraphContent()[1]).toEqual({ type: 'text', text: ' hello' })
  })

  it('preserves existing whitespace when a transaction also inserts text', () => {
    const editor = createLinkWithTrailingSpace()

    editor.view.dispatch(
      editor.state.tr.insertText('X', 2).addMark(1, 13, editor.schema.marks.bold.create()),
    )

    expect(paragraphContent()[0]).toMatchObject({
      text: 'cXlick here ',
      marks: [expect.objectContaining({ type: 'link' }), { type: 'bold' }],
    })
  })

  it('maps inserted whitespace through later steps', () => {
    const editor = createEditor('<p><a href="https://example.com">example</a></p>')

    editor.view.dispatch(editor.state.tr.insertText(' ', 8).insertText('X', 1))

    expect(paragraphContent()).toEqual([
      {
        type: 'text',
        text: 'Xexample',
        marks: [expect.objectContaining({ type: 'link' })],
      },
      { type: 'text', text: ' ' },
    ])
  })

  it.each(['append', 'prepend'])('unlinks adjacent spaces inserted with %s steps', order => {
    const editor = createEditor('<p><a href="https://example.com">example</a></p>')
    editor.commands.setTextSelection(8)

    const tr = editor.state.tr.insertText(' ')

    if (order === 'append') {
      tr.insertText(' ')
    } else {
      tr.insertText(' ', 8)
    }

    editor.view.dispatch(tr)

    expect(paragraphContent()).toEqual([
      {
        type: 'text',
        text: 'example',
        marks: [expect.objectContaining({ type: 'link' })],
      },
      { type: 'text', text: '  ' },
    ])

    type('hello')
    expect(paragraphContent()[1]).toEqual({ type: 'text', text: '  hello' })
  })

  it('preserves explicit stored marks for an unrelated cursor', () => {
    const editor = createEditor('<p><a href="https://example.com">example</a></p><p>other</p>')
    editor.commands.setTextSelection(editor.state.doc.content.size - 1)
    editor.commands.setBold()
    const storedMarks = editor.state.storedMarks

    editor.view.dispatch(editor.state.tr.insertText(' ', 8).setStoredMarks(storedMarks))

    expect(editor.state.storedMarks).toEqual(storedMarks)
    type('!')
    expect(editor.getJSON().content?.[1].content?.[1]).toEqual({
      type: 'text',
      text: '!',
      marks: [{ type: 'bold' }],
    })
  })

  it('does not extend an existing link when typing a space after it', () => {
    createEditor('<p><a href="https://example.com">https://example.com</a></p>')
    editor!.commands.setTextSelection(editor!.state.doc.content.size - 1)

    type(' hello')

    expect(paragraphContent()).toEqual([
      {
        type: 'text',
        text: 'https://example.com',
        marks: [expect.objectContaining({ type: 'link' })],
      },
      { type: 'text', text: ' hello' },
    ])
  })

  it('links a typed url after a space without linking the space', () => {
    createEditor('<p></p>')

    type('https://example.com next')

    expect(paragraphContent()).toEqual([
      {
        type: 'text',
        text: 'https://example.com',
        marks: [expect.objectContaining({ type: 'link' })],
      },
      { type: 'text', text: ' next' },
    ])
  })

  it('does not clear stored marks when the change is in another textblock', () => {
    createEditor(
      '<p><a href="https://example.com">https://example.com</a></p><p><a href="https://tiptap.dev">tiptap</a></p>',
    )

    // Cursor sits inside the second link
    const secondLinkInside = editor!.state.doc.content.size - 3
    editor!.commands.setTextSelection(secondLinkInside)

    // Insert whitespace at the end of the first paragraph, away from the selection
    const firstParagraphEnd = 'https://example.com'.length + 1
    editor!.view.dispatch(editor!.state.tr.insertText(' ', firstParagraphEnd, firstParagraphEnd))

    // Stored marks must stay null so the cursor keeps inheriting the link
    // from its surroundings, not the explicit empty set left by removeStoredMark.
    expect(editor!.state.storedMarks).toBeNull()
  })

  it('keeps a link intact when typing a space inside its text', () => {
    createEditor('<p><a href="https://tiptap.dev">click here</a></p>')
    // Position the cursor after "click"
    editor!.commands.setTextSelection(6)

    type(' ')

    expect(paragraphContent()).toEqual([
      {
        type: 'text',
        text: 'click  here',
        marks: [expect.objectContaining({ type: 'link' })],
      },
    ])
  })
})
