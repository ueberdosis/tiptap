import { Editor, Mark } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Link from '@tiptap/extension-link'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { afterEach, describe, expect, it } from 'vitest'

const Code = Mark.create({
  name: 'code',
  excludes: '_',
  code: true,

  parseHTML() {
    return [{ tag: 'code' }]
  },

  renderHTML() {
    return ['code', 0]
  },
})

describe('markdown links', () => {
  const editorElClass = 'tiptap'
  let editor: Editor | null = null

  const createEditorEl = () => {
    const editorEl = document.createElement('div')

    editorEl.classList.add(editorElClass)
    document.body.appendChild(editorEl)
    return editorEl
  }
  const getEditorEl = () => document.querySelector(`.${editorElClass}`)

  const createEditor = (options: Partial<ConstructorParameters<typeof Editor>[0]> = {}) => {
    editor = new Editor({
      element: createEditorEl(),
      extensions: [Document, Text, Paragraph, Link],
      ...options,
    })

    return editor
  }

  // Simulates typing a character at the end of the document,
  // the way the input rules plugin receives real keystrokes.
  // Returns whether a rule handled it.
  const typeAtEnd = (currentEditor: Editor, character: string) => {
    currentEditor.commands.setTextSelection(currentEditor.state.doc.nodeSize)

    return currentEditor.view.someProp('handleTextInput', f =>
      f(
        currentEditor.view,
        currentEditor.state.selection.from,
        currentEditor.state.selection.from,
        character,
      ),
    )
  }

  afterEach(() => {
    editor?.destroy()
    getEditorEl()?.remove()
  })

  describe('input rule', () => {
    it('converts the typed Markdown link syntax into a link', () => {
      createEditor({ content: '<p>Check out [Tiptap](https://tiptap.dev</p>' })

      const handled = typeAtEnd(editor!, ')')

      expect(handled).toBe(true)
      expect(editor!.getHTML()).toContain('href="https://tiptap.dev"')
      expect(editor!.getHTML()).toContain('>Tiptap</a>')
      expect(editor!.getHTML()).not.toContain('[')
      expect(editor!.state.doc.textContent).toBe('Check out Tiptap')
    })

    it('supports titles in straight quotes', () => {
      createEditor({ content: '<p>[Tiptap](https://tiptap.dev "Rich text editor"</p>' })

      const handled = typeAtEnd(editor!, ')')

      expect(handled).toBe(true)
      expect(editor!.getHTML()).toContain('href="https://tiptap.dev"')
      expect(editor!.getHTML()).toContain('title="Rich text editor"')
      expect(editor!.state.doc.textContent).toBe('Tiptap')
    })

    it('treats an empty title as no title, as in CommonMark', () => {
      createEditor({ content: '<p>[Tiptap](https://tiptap.dev ""</p>' })

      const handled = typeAtEnd(editor!, ')')

      expect(handled).toBe(true)
      expect(editor!.getHTML()).toContain('href="https://tiptap.dev"')
      expect(editor!.getHTML()).not.toContain('title=')
      expect(editor!.state.doc.textContent).toBe('Tiptap')
    })

    it('supports titles in curly quotes, as replaced by the Typography extension', () => {
      createEditor({ content: '<p>[Tiptap](https://tiptap.dev “Rich text editor”</p>' })

      const handled = typeAtEnd(editor!, ')')

      expect(handled).toBe(true)
      expect(editor!.getHTML()).toContain('title="Rich text editor"')
    })

    it('converts URLs containing balanced parentheses', () => {
      createEditor({ content: '<p>[Wiki](https://en.wikipedia.org/wiki/Node_(disambiguation)</p>' })

      const handled = typeAtEnd(editor!, ')')

      expect(handled).toBe(true)
      expect(editor!.getHTML()).toContain(
        'href="https://en.wikipedia.org/wiki/Node_(disambiguation)"',
      )
      expect(editor!.state.doc.textContent).toBe('Wiki')
    })

    it('does not fire on the closing parenthesis of a URL containing parentheses', () => {
      createEditor({ content: '<p>[Wiki](https://en.wikipedia.org/wiki/Node_(disambiguation</p>' })

      const handled = typeAtEnd(editor!, ')')

      expect(handled).toBeFalsy()
      expect(editor!.getHTML()).not.toContain('<a')
    })

    it('converts only the trailing link when another link precedes it', () => {
      createEditor({
        content: '<p>[alpha](https://alpha.example.com)[beta](https://beta.example.com</p>',
      })

      const handled = typeAtEnd(editor!, ')')

      expect(handled).toBe(true)
      expect(editor!.getHTML()).toContain('href="https://beta.example.com"')
      expect(editor!.getHTML()).not.toContain('href="https://alpha.example.com"')
      expect(editor!.state.doc.textContent).toBe('[alpha](https://alpha.example.com)beta')
    })

    it('converts non-http protocols allowed by default', () => {
      createEditor({ content: '<p>[Email](mailto:info@example.com</p>' })

      const handled = typeAtEnd(editor!, ')')

      expect(handled).toBe(true)
      expect(editor!.getHTML()).toContain('href="mailto:info@example.com"')
    })

    it('converts relative URLs', () => {
      createEditor({ content: '<p>[Docs](/docs/introduction</p>' })

      const handled = typeAtEnd(editor!, ')')

      expect(handled).toBe(true)
      expect(editor!.getHTML()).toContain('href="/docs/introduction"')
    })

    it('does not convert disallowed protocols', () => {
      // oxlint-disable-next-line no-script-url
      createEditor({ content: '<p>[click](javascript:alert(window.origin</p>' })

      const handled = typeAtEnd(editor!, ')')

      expect(handled).toBeFalsy()
      expect(editor!.getHTML()).not.toContain('<a')
    })

    it('does not convert the Markdown image syntax', () => {
      createEditor({ content: '<p>![alt](https://example.com/image.png</p>' })

      const handled = typeAtEnd(editor!, ')')

      expect(handled).toBeFalsy()
      expect(editor!.getHTML()).not.toContain('<a')
    })

    it('does not convert escaped brackets', () => {
      createEditor({ content: '<p>\\[Tiptap](https://tiptap.dev</p>' })

      const handled = typeAtEnd(editor!, ')')

      expect(handled).toBeFalsy()
      expect(editor!.getHTML()).not.toContain('<a')
    })

    it('does not convert whitespace-only link text', () => {
      createEditor({ content: '<p>[ ](https://tiptap.dev</p>' })

      const handled = typeAtEnd(editor!, ')')

      expect(handled).toBeFalsy()
      expect(editor!.getHTML()).not.toContain('<a')
    })

    it('does not convert inside code marks', () => {
      createEditor({
        extensions: [Document, Text, Paragraph, Code, Link],
        content: '<p><code>[Tiptap](https://tiptap.dev</code></p>',
      })

      const handled = typeAtEnd(editor!, ')')

      expect(handled).toBeFalsy()
      expect(editor!.getHTML()).not.toContain('<a')
    })

    it('can be disabled with the markdownLinks option', () => {
      createEditor({
        extensions: [Document, Text, Paragraph, Link.configure({ markdownLinks: false })],
        content: '<p>[Tiptap](https://tiptap.dev</p>',
      })

      const handled = typeAtEnd(editor!, ')')

      expect(handled).toBeFalsy()
      expect(editor!.getHTML()).not.toContain('<a')
    })

    it('respects a custom isAllowedUri option', () => {
      createEditor({
        extensions: [Document, Text, Paragraph, Link.configure({ isAllowedUri: () => false })],
        content: '<p>[Tiptap](https://tiptap.dev</p>',
      })

      const handled = typeAtEnd(editor!, ')')

      expect(handled).toBeFalsy()
      expect(editor!.getHTML()).not.toContain('<a')
    })
  })

  describe('paste rule', () => {
    it('converts pasted Markdown links', () => {
      createEditor()

      editor!.view.pasteText('Check out [Tiptap](https://tiptap.dev) today')

      expect(editor!.getHTML()).toContain('href="https://tiptap.dev"')
      expect(editor!.getHTML()).toContain('>Tiptap</a>')
      expect(editor!.state.doc.textContent).toBe('Check out Tiptap today')
    })

    it('converts multiple pasted Markdown links', () => {
      createEditor()

      editor!.view.pasteText(
        'See [alpha](https://alpha.example.com) and [beta](https://beta.example.com)',
      )

      expect(editor!.getHTML()).toContain('href="https://alpha.example.com"')
      expect(editor!.getHTML()).toContain('href="https://beta.example.com"')
      expect(editor!.state.doc.textContent).toBe('See alpha and beta')
    })

    it('converts adjacent Markdown links', () => {
      createEditor()

      editor!.view.pasteText('[alpha](https://alpha.example.com)[beta](https://beta.example.com)')

      expect(editor!.getHTML()).toContain('href="https://alpha.example.com"')
      expect(editor!.getHTML()).toContain('href="https://beta.example.com"')
      expect(editor!.state.doc.textContent).toBe('alphabeta')
    })

    it('converts pasted Markdown links with titles', () => {
      createEditor()

      editor!.view.pasteText('[Tiptap](https://tiptap.dev "Rich text editor")')

      expect(editor!.getHTML()).toContain('href="https://tiptap.dev"')
      expect(editor!.getHTML()).toContain('title="Rich text editor"')
      expect(editor!.state.doc.textContent).toBe('Tiptap')
    })

    it('does not convert disallowed protocols', () => {
      createEditor()

      // oxlint-disable-next-line no-script-url
      editor!.view.pasteText('[click](javascript:alert(window.origin))')

      expect(editor!.getHTML()).not.toContain('<a')
      expect(editor!.state.doc.textContent).toContain('[click](')
    })

    it('keeps the Markdown image syntax as plain text', () => {
      createEditor()

      editor!.view.pasteText('![alt](https://example.com/image.png)')

      // the bare URL inside may still get autolinked, we only care that the brackets survive
      expect(editor!.state.doc.textContent).toBe('![alt](https://example.com/image.png)')
    })

    it('can be disabled with the markdownLinks option', () => {
      createEditor({
        extensions: [Document, Text, Paragraph, Link.configure({ markdownLinks: false })],
      })

      editor!.view.pasteText('[Tiptap](https://tiptap.dev)')

      expect(editor!.state.doc.textContent).toBe('[Tiptap](https://tiptap.dev)')
    })
  })
})
