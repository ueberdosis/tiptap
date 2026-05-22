import { Editor } from '@tiptap/core'
import Mention from '@tiptap/extension-mention'
import StarterKit from '@tiptap/starter-kit'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

describe('setContent command', () => {
  let editor: Editor

  beforeEach(() => {
    const element = document.createElement('div')
    document.body.appendChild(element)
    editor = new Editor({
      element,
      extensions: [StarterKit, Mention],
      content: '',
    })
  })

  afterEach(() => {
    editor.destroy()
  })

  it('inserts raw text content', () => {
    editor.commands.setContent('Hello World.')
    expect(editor.getHTML()).toContain('<p>Hello World.</p>')
  })

  it('inserts raw JSON content', () => {
    editor.commands.setContent({
      type: 'paragraph',
      content: [{ type: 'text', text: 'Hello World.' }],
    })
    expect(editor.getHTML()).toContain('<p>Hello World.</p>')
  })

  it('inserts a Prosemirror Node as content', () => {
    editor.commands.setContent(editor.schema.node('paragraph', null, editor.schema.text('Hello World.')))
    expect(editor.getHTML()).toContain('<p>Hello World.</p>')
  })

  it('inserts a Prosemirror Fragment as content', () => {
    editor.commands.setContent(
      editor.schema.node('doc', null, editor.schema.node('paragraph', null, editor.schema.text('Hello World.')))
        .content,
    )
    expect(editor.getHTML()).toContain('<p>Hello World.</p>')
  })

  it('respects the emitUpdate option', () => {
    let updateCount = 0
    const callback = () => {
      updateCount += 1
    }
    editor.on('update', callback)

    editor.commands.setContent('Hello World.', { emitUpdate: true })
    const first = updateCount

    updateCount = 0
    editor.commands.setContent('Hello World again.', { emitUpdate: false })
    const second = updateCount
    editor.off('update', callback)

    expect(first).toBe(1)
    expect(second).toBe(0)
  })

  it('inserts more complex html content', () => {
    editor.commands.setContent(
      '<h1>Welcome to Tiptap</h1><p>This is a paragraph.</p><ul><li><p>List Item A</p></li><li><p>List Item B</p><ul><li><p>Subchild</p></li></ul></li></ul>',
    )
    expect(editor.getHTML()).toContain(
      '<h1>Welcome to Tiptap</h1><p>This is a paragraph.</p><ul><li><p>List Item A</p></li><li><p>List Item B</p><ul><li><p>Subchild</p></li></ul></li></ul>',
    )
  })

  it('removes newlines and tabs', () => {
    editor.commands.setContent('<p>Hello\n\tworld\n\t\thow\n\t\t\tnice.</p>')
    expect(editor.getHTML()).toContain('<p>Hello world how nice.</p>')
  })

  it('keeps newlines and tabs when preserveWhitespace = full', () => {
    editor.commands.setContent('<p>Hello\n\tworld\n\t\thow\n\t\t\tnice.</p>', {
      parseOptions: { preserveWhitespace: 'full' },
    })
    expect(editor.getHTML()).toContain('<p>Hello\n\tworld\n\t\thow\n\t\t\tnice.</p>')
  })

  it('overwrites existing content', () => {
    editor.commands.setContent('<p>Initial Content</p>')
    expect(editor.getHTML()).toContain('<p>Initial Content</p>')

    editor.commands.setContent('<p>Overwritten Content</p>')
    expect(editor.getHTML()).toContain('<p>Overwritten Content</p>')

    editor.commands.setContent('Content without tags')
    expect(editor.getHTML()).toContain('<p>Content without tags</p>')
  })

  it('inserts mentions', () => {
    editor.commands.setContent('<p><span data-type="mention" data-id="1" data-label="John Doe">@John Doe</span></p>')
    expect(editor.getHTML()).toContain(
      '<span data-type="mention" data-id="1" data-label="John Doe" data-mention-suggestion-char="@">@John Doe</span>',
    )
  })

  it('removes newlines and tabs between html fragments', () => {
    editor.commands.setContent('<h1>Tiptap</h1>\n\t<p><strong>Hello World</strong></p>')
    expect(editor.getHTML()).toContain('<h1>Tiptap</h1><p><strong>Hello World</strong></p>')
  })

  it('keeps newlines and tabs between html fragments when preserveWhitespace = full', () => {
    editor.commands.setContent('<h1>Tiptap</h1>\n\t<p><strong>Hello World</strong></p>', {
      parseOptions: { preserveWhitespace: 'full' },
    })
    expect(editor.getHTML()).toContain('<h1>Tiptap</h1><p>\n\t</p><p><strong>Hello World</strong></p>')
  })

  it('allows inserting nothing', () => {
    editor.commands.setContent('')
    expect(editor.getHTML()).toBeDefined()
  })

  it('allows inserting nothing when preserveWhitespace = full', () => {
    editor.commands.setContent('', { parseOptions: { preserveWhitespace: 'full' } })
    expect(editor.getHTML()).toBeDefined()
  })

  it('allows inserting a partial HTML tag', () => {
    editor.commands.setContent('<p>foo')
    expect(editor.getHTML()).toContain('<p>foo</p>')
  })

  it('allows inserting a partial HTML tag when preserveWhitespace = full', () => {
    editor.commands.setContent('<p>foo', { parseOptions: { preserveWhitespace: 'full' } })
    expect(editor.getHTML()).toContain('<p>foo</p>')
  })

  it('removes an incomplete HTML tag', () => {
    editor.commands.setContent('foo<p')
    expect(editor.getHTML()).toContain('<p>foo</p>')
  })

  it('allows inserting an incomplete HTML tag when preserveWhitespace = full', () => {
    editor.commands.setContent('foo<p', { parseOptions: { preserveWhitespace: 'full' } })
    expect(editor.getHTML()).toContain('<p>foo&lt;p</p>')
  })

  it('allows inserting a list', () => {
    editor.commands.setContent('<ul><li>ABC</li><li>123</li></ul>')
    expect(editor.getHTML()).toContain('<ul><li><p>ABC</p></li><li><p>123</p></li></ul>')
  })

  it('allows inserting a list when preserveWhitespace = full', () => {
    editor.commands.setContent('<ul><li>ABC</li><li>123</li></ul>', {
      parseOptions: { preserveWhitespace: 'full' },
    })
    expect(editor.getHTML()).toContain('<ul><li><p>ABC</p></li><li><p>123</p></li></ul>')
  })

  it('removes newlines and tabs when parseOptions.preserveWhitespace=false', () => {
    editor.commands.setContent('\n<h1>Tiptap</h1><p><strong>Hello\n World</strong>\n</p>\n', {
      parseOptions: { preserveWhitespace: false },
    })
    expect(editor.getHTML()).toContain('<h1>Tiptap</h1><p><strong>Hello World</strong></p>')
  })
})
