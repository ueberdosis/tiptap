import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Bold from '@tiptap/extension-bold'
import Link from '@tiptap/extension-link'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { afterEach, describe, expect, it } from 'vite-plus/test'

describe('pasting HTML links', () => {
  const editorElClass = 'tiptap'
  let editor: Editor | null = null

  const createEditorEl = () => {
    const editorEl = document.createElement('div')

    editorEl.classList.add(editorElClass)
    document.body.appendChild(editorEl)
    return editorEl
  }
  const getEditorEl = () => document.querySelector(`.${editorElClass}`)

  const createEditor = (
    linkOptions: Parameters<typeof Link.configure>[0] = {},
    options: Partial<ConstructorParameters<typeof Editor>[0]> = {},
  ) => {
    editor = new Editor({
      element: createEditorEl(),
      extensions: [Document, Text, Paragraph, Link.configure(linkOptions)],
      ...options,
    })

    return editor
  }

  // Dispatches a real paste event, so the paste rules see the clipboard HTML.
  const pasteHTML = (currentEditor: Editor, html: string, text = '') => {
    const clipboardData = new DataTransfer()

    clipboardData.setData('text/html', html)
    clipboardData.setData('text/plain', text)

    currentEditor.view.dom.dispatchEvent(
      new ClipboardEvent('paste', { clipboardData, bubbles: true, cancelable: true }),
    )
  }

  const getLinks = (currentEditor: Editor) =>
    Array.from(currentEditor.view.dom.querySelectorAll('a')).map(link => ({
      href: link.getAttribute('href'),
      text: link.textContent,
    }))

  afterEach(() => {
    editor?.destroy()
    getEditorEl()?.remove()
  })

  const fileUrl = 'https://github.com/ueberdosis/tiptap/blob/develop/LICENSE.md'

  ;[
    { name: 'default options', linkOptions: {} },
    { name: 'markdownLinks enabled', linkOptions: { markdownLinks: true } },
  ].forEach(({ name, linkOptions }) => {
    describe(name, () => {
      it('keeps the href of a pasted link whose text looks like a domain', () => {
        createEditor(linkOptions)

        pasteHTML(editor!, `<a href="${fileUrl}">LICENSE.md</a>`, 'LICENSE.md')

        expect(getLinks(editor!)).toEqual([{ href: fileUrl, text: 'LICENSE.md' }])
      })

      it('keeps the href of a pasted link whose text is a different URL', () => {
        createEditor(linkOptions)

        pasteHTML(
          editor!,
          '<a href="https://tiptap.dev/docs">https://example.com</a>',
          'https://example.com',
        )

        expect(getLinks(editor!)).toEqual([
          { href: 'https://tiptap.dev/docs', text: 'https://example.com' },
        ])
      })

      it('keeps the href when the link text contains more than the URL', () => {
        createEditor(linkOptions)

        pasteHTML(
          editor!,
          `<p>Read <a href="${fileUrl}">the LICENSE.md file</a> first</p>`,
          'Read the LICENSE.md file first',
        )

        expect(getLinks(editor!)).toEqual([{ href: fileUrl, text: 'the LICENSE.md file' }])
      })

      it('keeps the href when an earlier attribute contains ">"', () => {
        createEditor(linkOptions)

        pasteHTML(
          editor!,
          '<a title="2 > 1" href="https://tiptap.dev/docs">LICENSE.md</a>',
          'LICENSE.md',
        )

        expect(getLinks(editor!)).toEqual([{ href: 'https://tiptap.dev/docs', text: 'LICENSE.md' }])
      })

      it('keeps the href when the link text has inline formatting', () => {
        createEditor(linkOptions, {
          extensions: [Document, Text, Paragraph, Bold, Link.configure(linkOptions)],
        })

        pasteHTML(
          editor!,
          '<a href="https://tiptap.dev/docs"><strong>example.</strong>com</a>',
          'example.com',
        )

        const links = getLinks(editor!)

        expect(links.map(link => link.href)).toEqual(links.map(() => 'https://tiptap.dev/docs'))
        expect(links.map(link => link.text).join('')).toBe('example.com')
        expect(editor!.getHTML()).not.toContain('href="http://example.com"')
      })

      it('links a plain URL that is only partly inside a pasted link', () => {
        createEditor(linkOptions)

        // Only "example." is linked, so the URL "example.com" is not covered.
        pasteHTML(
          editor!,
          '<p><a href="https://tiptap.dev/docs">example.</a>com</p>',
          'example.com',
        )

        expect(editor!.getHTML()).toContain('href="http://example.com"')
      })

      it('still links plain URLs next to a pasted link', () => {
        createEditor(linkOptions)

        pasteHTML(
          editor!,
          `<p><a href="${fileUrl}">LICENSE.md</a> and https://example.com</p>`,
          'LICENSE.md and https://example.com',
        )

        expect(getLinks(editor!)).toEqual([
          { href: fileUrl, text: 'LICENSE.md' },
          { href: 'https://example.com', text: 'https://example.com' },
        ])
      })

      it('still links plain URLs pasted as HTML without links', () => {
        createEditor(linkOptions)

        pasteHTML(editor!, '<span>https://example.com</span>', 'https://example.com')

        expect(getLinks(editor!)).toEqual([
          { href: 'https://example.com', text: 'https://example.com' },
        ])
      })

      it('still updates the href when a plain URL is pasted inside an existing link', () => {
        createEditor(linkOptions, {
          content: '<p><a href="https://old.example.com">click here</a></p>',
        })

        editor!.commands.setTextSelection(6)
        editor!.view.pasteText('https://new.example.com')

        expect(editor!.getHTML()).toContain('href="https://new.example.com"')
        expect(editor!.getHTML()).toContain('href="https://old.example.com"')
      })
    })
  })
})
