/**
 * @vitest-environment happy-dom
 */

import { Editor } from '@tiptap/core'
import { TableOfContents } from '@tiptap/extension-table-of-contents'
import { Markdown, MarkdownManager } from '@tiptap/markdown'
import StarterKit from '@tiptap/starter-kit'
import { describe, expect, it } from 'vite-plus/test'

describe('HTML comments in Markdown', () => {
  const manager = new MarkdownManager({ extensions: [StarterKit] })

  it.each([
    ['## Week of <!-- date -->', 'heading', 'Week of <!-- date -->'],
    ['before <!-- date --> after', 'paragraph', 'before <!-- date --> after'],
    ['<!-- date -->', 'paragraph', '<!-- date -->'],
    ['## <!-- first --> <!-- second -->', 'heading', '<!-- first --> <!-- second -->'],
    ['<!-- first\nsecond -->', 'paragraph', '<!-- first\nsecond -->'],
  ])('preserves comments in %s as literal text', (markdown, type, text) => {
    expect(window.DOMParser).toBeDefined()

    expect(manager.parse(markdown).content).toEqual([
      {
        type,
        ...(type === 'heading' ? { attrs: { level: 2 } } : {}),
        content: [{ type: 'text', text }],
      },
    ])
  })

  it('preserves consecutive block comments', () => {
    expect(manager.parse('<!-- first -->\n<!-- second -->\n').content).toEqual([
      { type: 'paragraph', content: [{ type: 'text', text: '<!-- first -->' }] },
      { type: 'paragraph', content: [{ type: 'text', text: '<!-- second -->' }] },
    ])
  })

  it('keeps headings valid when table of contents updates them', () => {
    const editor = new Editor({
      extensions: [StarterKit, Markdown, TableOfContents],
      content: '## Week of <!-- date -->',
      contentType: 'markdown',
    })

    try {
      expect(() => editor.state.doc.check()).not.toThrow()
      expect(() => editor.commands.insertContent('!')).not.toThrow()
      expect(() => editor.state.doc.check()).not.toThrow()
      expect(editor.state.doc.textContent).toContain('<!-- date -->')
    } finally {
      editor.destroy()
    }
  })

  it('still parses a real empty HTML paragraph', () => {
    expect(manager.parse('<p></p>').content).toEqual([{ type: 'paragraph' }])
  })

  it('still parses HTML elements that contain comments', () => {
    expect(manager.parse('<p>before <!-- date --> after</p>').content).toEqual([
      { type: 'paragraph', content: [{ type: 'text', text: 'before after' }] },
    ])
  })

  it('still parses HTML elements between comments', () => {
    expect(manager.parse('<!-- before --><p>text</p><!-- after -->').content).toEqual([
      { type: 'paragraph', content: [{ type: 'text', text: 'text' }] },
    ])
  })
})
