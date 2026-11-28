import { Blockquote } from '@tiptap/extension-blockquote'
import { Document } from '@tiptap/extension-document'
import { HardBreak } from '@tiptap/extension-hard-break'
import { Heading } from '@tiptap/extension-heading'
import { BulletList, ListItem, OrderedList } from '@tiptap/extension-list'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Text } from '@tiptap/extension-text'
import { Markdown, MarkdownManager } from '@tiptap/markdown'
import { beforeEach, describe, expect, it } from 'vite-plus/test'
// Keep the vite-plus import on this line so fallow still treats it as inherited.
import { Editor } from '@tiptap/core'
import { StarterKit } from '@tiptap/starter-kit'

describe('Paragraph Markdown Rendering', () => {
  let markdownManager: MarkdownManager

  beforeEach(() => {
    markdownManager = new MarkdownManager({
      extensions: [
        Document,
        Paragraph,
        Text,
        Heading,
        Blockquote,
        BulletList,
        OrderedList,
        ListItem,
      ],
    })
  })

  describe('empty paragraphs at doc level', () => {
    it('should omit a lone empty paragraph at doc root', () => {
      const doc = {
        type: 'doc',
        content: [{ type: 'paragraph', content: [] }],
      }

      const raw = markdownManager.renderNodes(doc)
      expect(raw).toBe('')
    })

    it('should preserve a single empty paragraph between two content paragraphs as blank markdown lines', () => {
      const doc = {
        type: 'doc',
        content: [
          { type: 'paragraph', content: [{ type: 'text', text: 'First' }] },
          { type: 'paragraph', content: [] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Second' }] },
        ],
      }

      const markdown = markdownManager.serialize(doc)
      expect(markdown).toBe('First\n\n\n\nSecond')
    })

    it('should use &nbsp; to preserve additional blank paragraphs between two content paragraphs', () => {
      const doc = {
        type: 'doc',
        content: [
          { type: 'paragraph', content: [{ type: 'text', text: 'First' }] },
          { type: 'paragraph', content: [] },
          { type: 'paragraph', content: [] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Second' }] },
        ],
      }

      const markdown = markdownManager.serialize(doc)
      expect(markdown).toBe('First\n\n\n\n&nbsp;\n\nSecond')
    })

    it('should keep a preserved blank paragraph marker after the first blank paragraph', () => {
      const input = 'First\n\n&nbsp;\n\nSecond'
      const json = markdownManager.parse(input)
      const output = markdownManager.serialize(json)
      expect(output.trim()).toBe('First\n\n\n\nSecond')
    })

    it('should preserve a trailing empty paragraph as trailing markdown spacing', () => {
      const doc = {
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 1 },
            content: [{ type: 'text', text: 'Markdown Test' }],
          },
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'Click "Parse Markdown" to load content from the left panel.' },
            ],
          },
          { type: 'paragraph', content: [] },
        ],
      }

      const markdown = markdownManager.serialize(doc)
      expect(markdown).toBe(
        '# Markdown Test\n\nClick "Parse Markdown" to load content from the left panel.\n\n',
      )
    })
  })

  describe('empty paragraphs inside nested nodes', () => {
    it('should not emit &nbsp; for an empty paragraph inside a bullet list item', () => {
      const doc = {
        type: 'doc',
        content: [
          {
            type: 'bulletList',
            content: [
              {
                type: 'listItem',
                content: [{ type: 'paragraph', content: [] }],
              },
            ],
          },
        ],
      }

      const markdown = markdownManager.serialize(doc)
      expect(markdown).toBe('- ')
    })

    it('should not emit &nbsp; for an empty paragraph inside an ordered list item', () => {
      const doc = {
        type: 'doc',
        content: [
          {
            type: 'orderedList',
            content: [
              {
                type: 'listItem',
                content: [{ type: 'paragraph', content: [] }],
              },
            ],
          },
        ],
      }

      const markdown = markdownManager.serialize(doc)
      expect(markdown).toBe('1. ')
    })

    it('should keep the first empty paragraph inside a blockquote empty', () => {
      const doc = {
        type: 'doc',
        content: [
          {
            type: 'blockquote',
            content: [{ type: 'paragraph', content: [] }],
          },
        ],
      }

      const markdown = markdownManager.serialize(doc)
      expect(markdown).toBe('>')
    })

    it('should preserve multiple empty paragraphs inside a blockquote with &nbsp; after the first', () => {
      const doc = {
        type: 'doc',
        content: [
          {
            type: 'blockquote',
            content: [
              { type: 'paragraph', content: [{ type: 'text', text: 'First' }] },
              { type: 'paragraph', content: [] },
              { type: 'paragraph', content: [] },
              { type: 'paragraph', content: [{ type: 'text', text: 'Second' }] },
            ],
          },
        ],
      }

      const markdown = markdownManager.serialize(doc)

      expect(markdown).toContain('> First')
      expect(markdown).toContain('> Second')
      expect(markdown).toContain('> &nbsp;')
    })

    it('should roundtrip multiple empty paragraphs inside a blockquote without losing any', () => {
      const doc = {
        type: 'doc',
        content: [
          {
            type: 'blockquote',
            content: [
              { type: 'paragraph', content: [{ type: 'text', text: 'First' }] },
              { type: 'paragraph', content: [] },
              { type: 'paragraph', content: [] },
              { type: 'paragraph', content: [] },
              { type: 'paragraph', content: [{ type: 'text', text: 'Second' }] },
            ],
          },
        ],
      }

      const markdown = markdownManager.serialize(doc)
      const parsed = markdownManager.parse(markdown)
      const blockquote = parsed.content![0]

      expect(markdown).toBe('> First\n>\n>\n>\n> &nbsp;\n>\n> &nbsp;\n>\n> Second')
      expect(blockquote.type).toBe('blockquote')
      expect(blockquote.content).toHaveLength(5)
      expect(
        blockquote
          .content!.slice(1, 4)
          .every(node => node.type === 'paragraph' && node.content?.length === 0),
      ).toBe(true)
    })

    it('should render content paragraphs inside bullet list items normally', () => {
      const doc = {
        type: 'doc',
        content: [
          {
            type: 'bulletList',
            content: [
              {
                type: 'listItem',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] }],
              },
              {
                type: 'listItem',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'World' }] }],
              },
            ],
          },
        ],
      }

      const markdown = markdownManager.serialize(doc)
      expect(markdown).toBe('- Hello\n- World')
    })

    it('should roundtrip consecutive empty paragraphs inside a bullet list item', () => {
      const doc = {
        type: 'doc',
        content: [
          {
            type: 'bulletList',
            content: [
              {
                type: 'listItem',
                content: [
                  { type: 'paragraph', content: [{ type: 'text', text: 'First' }] },
                  { type: 'paragraph', content: [] },
                  { type: 'paragraph', content: [] },
                  { type: 'paragraph', content: [{ type: 'text', text: 'Second' }] },
                ],
              },
            ],
          },
        ],
      }

      const markdown = markdownManager.serialize(doc)
      const parsed = markdownManager.parse(markdown)
      const listItem = parsed.content![0].content![0]

      expect(markdown).toBe('- First\n\n  \n\n  &nbsp;\n\n  Second')
      expect(listItem.type).toBe('listItem')
      expect(listItem.content).toHaveLength(4)
      expect(listItem.content![1].content).toEqual([])
      expect(listItem.content![2].content).toEqual([])
    })
  })
})

describe('consecutive hard breaks markdown round trip', () => {
  const roundTrip = (html: string) => {
    const editor = new Editor({
      extensions: [StarterKit.configure({ trailingNode: false }), Markdown],
      content: html,
    })

    const markdown = editor.getMarkdown()

    editor.commands.setContent(markdown, { contentType: 'markdown' })

    const result = { markdown, html: editor.getHTML() }

    editor.destroy()

    return result
  }

  it('keeps two hard breaks inside a paragraph', () => {
    const result = roundTrip('<p>Line 1<br><br>Line 2</p>')

    expect(result.html).toBe('<p>Line 1<br><br>Line 2</p>')
  })

  it('keeps three hard breaks inside a paragraph', () => {
    const result = roundTrip('<p>Line 1<br><br><br>Line 2</p>')

    expect(result.html).toBe('<p>Line 1<br><br><br>Line 2</p>')
  })

  it('keeps a trailing run of hard breaks', () => {
    const result = roundTrip('<p>Line 1<br><br></p>')

    expect(result.html).toBe('<p>Line 1<br><br></p>')
    expect(result.markdown).not.toContain('\\')
  })

  it('keeps a leading run of hard breaks', () => {
    const result = roundTrip('<p><br><br>Line 2</p>')

    expect(result.html).toBe('<p><br><br>Line 2</p>')
  })

  it('keeps consecutive hard breaks in a bullet list', () => {
    const result = roundTrip('<ul><li><p>Line 1<br><br>Line 2</p></li></ul>')

    expect(result.html).toBe('<ul><li><p>Line 1<br><br>Line 2</p></li></ul>')
  })

  it('keeps a trailing hard-break run before the next list item', () => {
    const result = roundTrip('<ul><li><p>Line 1<br><br></p></li><li><p>Next</p></li></ul>')

    expect(result.html).toBe('<ul><li><p>Line 1<br><br></p></li><li><p>Next</p></li></ul>')
  })

  it('keeps consecutive hard breaks in an ordered list', () => {
    const result = roundTrip('<ol><li><p>Line 1<br><br>Line 2</p></li></ol>')

    expect(result.html).toBe('<ol><li><p>Line 1<br><br>Line 2</p></li></ol>')
  })

  it('keeps consecutive hard breaks in a blockquote', () => {
    const result = roundTrip('<blockquote><p>Line 1<br><br>Line 2</p></blockquote>')

    expect(result.html).toBe('<blockquote><p>Line 1<br><br>Line 2</p></blockquote>')
  })

  it('keeps a single hard break at the start of a paragraph', () => {
    const result = roundTrip('<p><br>Line 2</p>')

    expect(result.html).toBe('<p><br>Line 2</p>')
  })

  it('keeps a single hard break at the end of a paragraph', () => {
    const result = roundTrip('<p>Line 1<br></p>')

    expect(result.html).toBe('<p>Line 1<br></p>')
    expect(result.markdown).toBe('Line 1<br>')
  })

  it('still serializes a single hard break as two trailing spaces', () => {
    const result = roundTrip('<p>Line 1<br>Line 2</p>')

    expect(result.markdown).toBe('Line 1  \nLine 2')
    expect(result.html).toBe('<p>Line 1<br>Line 2</p>')
  })

  it('uses two trailing spaces for a single middle break in a node array', () => {
    const manager = new MarkdownManager({ extensions: [Document, Paragraph, Text, HardBreak] })

    const markdown = manager.serialize([
      { type: 'text', text: 'Line 1' },
      { type: 'hardBreak' },
      { type: 'text', text: 'Line 2' },
    ] as any)

    expect(markdown).toBe('Line 1  \nLine 2')
  })
})
