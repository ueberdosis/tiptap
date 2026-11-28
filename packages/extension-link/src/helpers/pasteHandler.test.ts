import { Editor, Extension } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Link from '@tiptap/extension-link'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { Fragment, Slice } from '@tiptap/pm/model'
import { Plugin } from '@tiptap/pm/state'
import { afterEach, describe, expect, it } from 'vite-plus/test'

// Turns the pasted text into a link whose href differs from its label
const LinkedTextParser = Extension.create({
  name: 'linkedTextParser',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          clipboardTextParser: (text, _context, _plain, view) => {
            if (text !== 'https://label.example') {
              return null
            }

            const { schema } = view.state
            const label = schema.text(text, [
              schema.marks.link.create({ href: 'https://target.example' }),
            ])

            return new Slice(Fragment.from(schema.nodes.paragraph.create(null, label)), 0, 0)
          },
        },
      }),
    ]
  },
})

const createLinkedEditor = (selection: { from: number; to: number }) => {
  const editor = new Editor({
    element: document.createElement('div'),
    extensions: [Document, Text, Paragraph, Link],
    content: '<p><a href="https://old.example">old link text</a></p>',
  })

  editor.commands.setTextSelection(selection)

  return editor
}

const createEditor = (options: { extensions?: Extension[]; enablePasteRules?: boolean } = {}) => {
  const editor = new Editor({
    element: document.createElement('div'),
    extensions: [Document, Text, Paragraph, Link, ...(options.extensions ?? [])],
    // The link paste rule would re-link the inserted text, which is out of scope here
    ...(options.enablePasteRules === undefined
      ? {}
      : { enablePasteRules: options.enablePasteRules }),
    content: '<p>word</p>',
  })

  editor.commands.setTextSelection({ from: 1, to: 5 })

  return editor
}

const paste = (editor: Editor, data: { text: string; html?: string }) => {
  const clipboardData = new DataTransfer()

  clipboardData.setData('text/plain', data.text)
  if (data.html) {
    clipboardData.setData('text/html', data.html)
  }
  editor.view.dom.dispatchEvent(
    new ClipboardEvent('paste', { clipboardData, bubbles: true, cancelable: true }),
  )
}

const getLinkedText = (editor: Editor) =>
  (editor.getJSON().content?.[0].content ?? []).map(node => ({
    text: node.text,
    href: node.marks?.find(mark => mark.type === 'link')?.attrs?.href,
  }))

describe('pasteHandler', () => {
  let editor: Editor

  afterEach(() => editor?.destroy())

  it('links the selected text when a bare URL is pasted', () => {
    editor = createEditor()

    paste(editor, { text: 'https://x.example' })

    expect(getLinkedText(editor)).toEqual([{ text: 'word', href: 'https://x.example' }])
  })

  it('links the selected text when the pasted link has the same href as its text', () => {
    editor = createEditor()

    paste(editor, {
      text: 'https://x.example',
      html: '<a href="https://x.example">https://x.example</a>',
    })

    expect(getLinkedText(editor)).toEqual([{ text: 'word', href: 'https://x.example' }])
  })

  it('keeps the link created by a text parser on a plain-text paste', () => {
    editor = createEditor({ extensions: [LinkedTextParser], enablePasteRules: false })

    paste(editor, { text: 'https://label.example' })

    expect(getLinkedText(editor)).toEqual([
      { text: 'https://label.example', href: 'https://target.example' },
    ])
  })

  it('links the selected text when a differing link is pasted as HTML', () => {
    editor = createEditor()

    paste(editor, {
      text: 'https://label.example',
      html: '<a href="https://target.example">https://label.example</a>',
    })

    expect(getLinkedText(editor)).toEqual([{ text: 'word', href: 'https://label.example' }])
  })

  describe('pasting over an existing link', () => {
    const partiallyRelinked = (href: string) => [
      { text: 'old ', href: 'https://old.example' },
      { text: 'link', href },
      { text: ' text', href: 'https://old.example' },
    ]

    it('moves the link of the selected part when a bare URL is pasted', () => {
      editor = createLinkedEditor({ from: 5, to: 9 })

      paste(editor, { text: 'https://new.example' })

      expect(getLinkedText(editor)).toEqual(partiallyRelinked('https://new.example'))
    })

    it('relinks the whole link when it is fully selected', () => {
      editor = createLinkedEditor({ from: 1, to: 14 })

      paste(editor, { text: 'https://new.example' })

      expect(getLinkedText(editor)).toEqual([
        { text: 'old link text', href: 'https://new.example' },
      ])
    })

    it('ignores a trailing newline on the pasted URL', () => {
      editor = createLinkedEditor({ from: 5, to: 9 })

      paste(editor, { text: 'https://new.example\n' })

      expect(getLinkedText(editor)).toEqual(partiallyRelinked('https://new.example'))
    })

    it('uses the label URL when a differing HTML link is pasted', () => {
      editor = createLinkedEditor({ from: 5, to: 9 })

      paste(editor, {
        text: 'https://label.example',
        html: '<a href="https://target.example">https://label.example</a>',
      })

      expect(getLinkedText(editor)).toEqual(partiallyRelinked('https://label.example'))
    })
  })
})
