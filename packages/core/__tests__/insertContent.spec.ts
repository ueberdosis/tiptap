import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { Color, TextStyle } from '@tiptap/extension-text-style'
import StarterKit from '@tiptap/starter-kit'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

describe('insertContent', () => {
  let editor: Editor

  afterEach(() => {
    editor?.destroy()
  })

  it('inserts plain text object {type: "text", text: "world"}', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text],
      content: '<p>hello</p>',
    })

    // Place cursor at the end of "hello" (position 6)
    editor.commands.setTextSelection(6)

    const result = editor.commands.insertContent({ type: 'text', text: 'world' })

    expect(result).toBe(true)
    expect(editor.getHTML()).toBe('<p>helloworld</p>')
  })
})

describe('insertContent command', () => {
  let editor: Editor

  beforeEach(() => {
    const element = document.createElement('div')
    document.body.appendChild(element)
    editor = new Editor({
      element,
      extensions: [Image, Color, TextStyle, Link, StarterKit],
      content: '',
    })
  })

  afterEach(() => {
    editor.destroy()
  })

  it('inserts html content correctly', () => {
    editor.commands.insertContent(
      '<h1><a href="https://tiptap.dev/">Tiptap</a></h1><p><strong>Hello World</strong></p><p>This is a paragraph<br />with a break.</p><p>And this is some additional string content.</p>',
    )

    expect(editor.getHTML()).toContain(
      '<h1><a target="_blank" rel="noopener noreferrer nofollow" href="https://tiptap.dev/">Tiptap</a></h1><p><strong>Hello World</strong></p><p>This is a paragraph<br>with a break.</p><p>And this is some additional string content.</p>',
    )
  })

  it('keeps spaces inbetween tags in html content', () => {
    editor.commands.insertContent('<p><b>Hello</b> <i>World</i></p>')
    expect(editor.getHTML()).toContain('<p><strong>Hello</strong> <em>World</em></p>')
  })

  it('keeps empty spaces', () => {
    editor.commands.insertContent('  ')
    expect(editor.getHTML()).toContain('<p>  </p>')
  })

  it('inserts text content correctly', () => {
    editor.commands.insertContent(`Hello World
This is content with a new line. Is this working?

Lets see if multiple new lines are inserted correctly

And more lines`)

    expect(editor.getText()).toContain(
      'Hello World\nThis is content with a new line. Is this working?\n\nLets see if multiple new lines are inserted correctly',
    )
  })

  it('keeps newlines in pre tag', () => {
    editor.commands.insertContent('<pre><code>foo\nbar</code></pre>')
    expect(editor.getHTML()).toContain('<pre><code>foo\nbar</code></pre>')
  })

  it('keeps newlines and tabs', () => {
    editor.commands.insertContent('<p>Hello\n\tworld\n\t\thow\n\t\t\tnice.\ntest\tOK</p>')
    expect(editor.getHTML()).toContain('<p>Hello\n\tworld\n\t\thow\n\t\t\tnice.\ntest\tOK</p>')
  })

  it('keeps newlines and tabs between html fragments', () => {
    editor.commands.insertContent('<h1>Tiptap</h1>\n<p><strong>Hello World</strong></p>')
    expect(editor.getHTML()).toContain('<h1>Tiptap</h1><p><strong>Hello World</strong></p>')
  })

  it('allows inserting nothing', () => {
    editor.commands.insertContent('')
    expect(editor.getHTML()).toBeDefined()
  })

  it('allows inserting a partial HTML tag', () => {
    editor.commands.insertContent('<p>foo')
    expect(editor.getHTML()).toContain('<p>foo</p>')
  })

  it('allows inserting an incomplete HTML tag', () => {
    editor.commands.insertContent('foo<p')
    expect(editor.getHTML()).toContain('<p>foo&lt;p</p>')
  })

  it('allows inserting a list', () => {
    editor.commands.insertContent('<ul><li>ABC</li><li>123</li></ul>')
    expect(editor.getHTML()).toContain('<ul><li><p>ABC</p></li><li><p>123</p></li></ul>')
  })

  it('removes newlines and tabs when parseOptions.preserveWhitespace=false', () => {
    editor.commands.insertContent('\n<h1>Tiptap</h1><p><strong>Hello\n World</strong>\n</p>\n', {
      parseOptions: { preserveWhitespace: false },
    })
    expect(editor.getHTML()).toContain('<h1>Tiptap</h1><p><strong>Hello World</strong></p>')
  })

  it('splits content when image is inserted inbetween text', () => {
    editor.commands.insertContent('<p>HelloWorld</p>')
    editor.commands.setTextSelection(6)
    editor.commands.insertContent('<img src="https://example.image/1" alt="This is an example" />')

    expect(editor.getHTML()).toContain(
      '<p>Hello</p><img src="https://example.image/1" alt="This is an example"><p>World</p>',
    )
  })

  it('does not split content when image is inserted at beginning of text', () => {
    editor.commands.insertContent('<p>HelloWorld</p>')
    editor.commands.setTextSelection(1)
    editor.commands.insertContent('<img src="https://example.image/1" alt="This is an example" />')

    expect(editor.getHTML()).toContain(
      '<img src="https://example.image/1" alt="This is an example"><p>HelloWorld</p>',
    )
  })

  it('respects editor.options.parseOptions if defined to be `false`', () => {
    editor.options.parseOptions = { preserveWhitespace: false }
    editor.commands.insertContent('\n<h1>Tiptap</h1><p><strong>Hello\n World</strong>\n</p>\n')
    expect(editor.getHTML()).toContain('<h1>Tiptap</h1><p><strong>Hello World</strong></p>')
  })

  it('respects editor.options.parseOptions if defined to be `full`', () => {
    editor.options.parseOptions = { preserveWhitespace: 'full' }
    editor.commands.insertContent('\n<h1>Tiptap</h1><p><strong>Hello\n World</strong>\n</p>\n')
    expect(editor.getHTML()).toContain('<h1>Tiptap</h1><p><strong>Hello\n World</strong></p>')
  })

  it('respects editor.options.parseOptions if defined to be `true`', () => {
    editor.options.parseOptions = { preserveWhitespace: true }
    editor.commands.insertContent('<h1>Tiptap</h1><p><strong>Hello\n World</strong>\n</p>')
    expect(editor.getHTML()).toContain('<h1>Tiptap</h1><p><strong>Hello<br> World</strong></p>')
  })
})

describe('insertContent command — applying rules', () => {
  let editor: Editor

  beforeEach(() => {
    const element = document.createElement('div')
    document.body.appendChild(element)
    editor = new Editor({
      element,
      extensions: [StarterKit],
      content: '',
    })
  })

  afterEach(() => {
    editor.destroy()
  })

  it('applies list InputRule', async () => {
    editor.commands.insertContent('-', { applyInputRules: true })
    editor.commands.insertContent(' ', { applyInputRules: true })
    // applyInputRules schedules rule evaluation via setTimeout(0)
    await new Promise(resolve => {
      setTimeout(resolve, 0)
    })
    expect(editor.getHTML()).toContain('<ul><li><p></p></li></ul>')
  })

  it('applies markdown using a PasteRule', () => {
    editor.commands.insertContentAt(1, '*This is an italic text*', { applyPasteRules: true })
    expect(editor.getHTML()).toContain('<p><em>This is an italic text</em></p>')
  })
})
