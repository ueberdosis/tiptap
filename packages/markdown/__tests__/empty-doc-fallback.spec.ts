import { Editor, Extension } from '@tiptap/core'
import { Document } from '@tiptap/extension-document'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Text } from '@tiptap/extension-text'
import { Markdown, MarkdownManager } from '@tiptap/markdown'
import { afterEach, describe, expect, it } from 'vitest'

// A custom extension whose markdown handler returns a bare top-level text
// node instead of wrapping it in a block. Simulates a third-party extension
// misbehaving, to prove the doc-validity fallback doesn't just check
// `content.length > 0`.
const BareTextBlock = Extension.create({
  name: 'bareTextBlock',
  markdownTokenName: 'bareTextBlock',
  parseMarkdown: token => ({ type: 'text', text: token.text || '' }),
  markdownTokenizer: {
    name: 'bareTextBlock',
    level: 'block',
    start: ':::bare',
    tokenize: (src: string) => {
      const match = src.match(/^:::bare\s+(.+?)\s+:::/)
      if (!match) {
        return undefined
      }
      return { type: 'bareTextBlock', raw: match[0], text: match[1] }
    },
  },
})

/**
 * Regression tests for #7914.
 *
 * A `doc` node requires at least one block child, so markdown that yields no
 * renderable blocks must not parse to a doc with empty content — that makes
 * `setContent` throw `RangeError: Invalid content for node doc: <>`.
 */
describe('markdown parse never yields an empty document (#7914)', () => {
  let editor: Editor | undefined
  afterEach(() => editor?.destroy())

  const mm = new MarkdownManager({ extensions: [Document, Paragraph, Text] })

  it.each([['           /               '], ['               \\'], ['   '], ['']])(
    'parse(%j) returns a valid doc with at least one block',
    input => {
      const json = mm.parse(input)
      expect(json.type).toBe('doc')
      expect(json.content!.length).toBeGreaterThanOrEqual(1)
      expect(json.content![0].type).toBe('paragraph')
    },
  )

  it('setContent with whitespace+slash markdown does not throw', () => {
    expect(() => {
      editor = new Editor({
        extensions: [Document, Paragraph, Text, Markdown],
        content: '           /               ',
        contentType: 'markdown',
      })
    }).not.toThrow()
    expect(editor!.getJSON().content![0].type).toBe('paragraph')
  })

  it('editor.commands.setContent with whitespace+slash markdown does not throw', () => {
    editor = new Editor({ extensions: [Document, Paragraph, Text, Markdown] })

    expect(() => {
      editor!.commands.setContent('           /               ', { contentType: 'markdown' })
    }).not.toThrow()
    expect(editor!.getJSON().content![0].type).toBe('paragraph')
  })

  it('still parses meaningful single-character content', () => {
    expect(mm.parse('/')).toMatchObject({
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: '/' }] }],
    })
  })

  it('falls back to a paragraph when a custom handler yields a bare top-level text node', () => {
    const bareTextManager = new MarkdownManager({
      extensions: [Document, Paragraph, Text, BareTextBlock],
    })
    const json = bareTextManager.parse(':::bare hello :::')

    expect(json.type).toBe('doc')
    expect(json.content!.length).toBeGreaterThanOrEqual(1)
    expect(json.content![0].type).toBe('paragraph')
  })

  it('setContent does not throw when a custom handler yields a bare top-level text node', () => {
    expect(() => {
      editor = new Editor({
        extensions: [Document, Paragraph, Text, Markdown, BareTextBlock],
        content: ':::bare hello :::',
        contentType: 'markdown',
      })
    }).not.toThrow()
    expect(editor!.getJSON().content![0].type).toBe('paragraph')
  })
})
