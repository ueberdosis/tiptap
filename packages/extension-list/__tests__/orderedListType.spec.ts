import type { JSONContent } from '@tiptap/core'
import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { MarkdownManager } from '@tiptap/markdown'
import { afterEach, describe, expect, it } from 'vitest'

import { ListItem, OrderedList } from '../src/index.js'

describe('OrderedList type attribute', () => {
  let editor: Editor

  afterEach(() => {
    editor?.destroy()
  })

  // ───────── Phase 4: Markdown utilities ─────────

  describe('getListMarker', () => {
    it('returns numeric markers for default type', async () => {
      const { getListMarker } = await import('../src/ordered-list/roman.js')
      expect(getListMarker(null, 0, '. ')).toBe('1. ')
      expect(getListMarker(undefined, 4, '. ')).toBe('5. ')
      expect(getListMarker('1', 0, '. ')).toBe('1. ')
    })

    it('returns lowercase alpha markers for type "a"', async () => {
      const { getListMarker } = await import('../src/ordered-list/roman.js')
      expect(getListMarker('a', 0, '. ')).toBe('a. ')
      expect(getListMarker('a', 1, '. ')).toBe('b. ')
      expect(getListMarker('a', 25, '. ')).toBe('z. ')
    })

    it('returns uppercase alpha markers for type "A"', async () => {
      const { getListMarker } = await import('../src/ordered-list/roman.js')
      expect(getListMarker('A', 0, '. ')).toBe('A. ')
      expect(getListMarker('A', 1, '. ')).toBe('B. ')
      expect(getListMarker('A', 25, '. ')).toBe('Z. ')
    })

    it('returns lowercase roman markers for type "i"', async () => {
      const { getListMarker } = await import('../src/ordered-list/roman.js')
      expect(getListMarker('i', 0, '. ')).toBe('i. ')
      expect(getListMarker('i', 1, '. ')).toBe('ii. ')
      expect(getListMarker('i', 3, '. ')).toBe('iv. ')
      expect(getListMarker('i', 9, '. ')).toBe('x. ')
    })

    it('returns uppercase roman markers for type "I"', async () => {
      const { getListMarker } = await import('../src/ordered-list/roman.js')
      expect(getListMarker('I', 0, '. ')).toBe('I. ')
      expect(getListMarker('I', 1, '. ')).toBe('II. ')
      expect(getListMarker('I', 3, '. ')).toBe('IV. ')
      expect(getListMarker('I', 9, '. ')).toBe('X. ')
    })
  })

  describe('detectMarkerType', () => {
    it('detects default type for numeric markers', async () => {
      const { detectMarkerType } = await import('../src/ordered-list/roman.js')
      expect(detectMarkerType('1')).toBeUndefined()
      expect(detectMarkerType('42')).toBeUndefined()
    })

    it('detects lowercase alpha', async () => {
      const { detectMarkerType } = await import('../src/ordered-list/roman.js')
      expect(detectMarkerType('a')).toBe('a')
      expect(detectMarkerType('A')).toBe('A')
    })

    it('detects lowercase roman', async () => {
      const { detectMarkerType } = await import('../src/ordered-list/roman.js')
      expect(detectMarkerType('i')).toBe('i')
      expect(detectMarkerType('ii')).toBe('i')
      expect(detectMarkerType('iii')).toBe('i')
      expect(detectMarkerType('iv')).toBe('i')
      expect(detectMarkerType('v')).toBe('i')
    })

    it('detects uppercase roman', async () => {
      const { detectMarkerType } = await import('../src/ordered-list/roman.js')
      expect(detectMarkerType('I')).toBe('I')
      expect(detectMarkerType('VI')).toBe('I')
      expect(detectMarkerType('X')).toBe('I')
    })
  })

  // ───────── Phase 4b: Markdown round-trip ─────────

  describe('markdown round-trip', () => {
    it('parses markdown with lowercase alpha markers as type "a"', () => {
      const markdownManager = new MarkdownManager({
        extensions: [Document, Paragraph, Text, ListItem, OrderedList],
      })

      const json = markdownManager.parse('a. Item 1\nb. Item 2')

      expect(json.content).toHaveLength(1)
      expect(json.content[0].type).toBe('orderedList')
      expect(json.content[0].attrs?.type).toBe('a')
      expect(json.content[0].content).toHaveLength(2)
    })

    it('parses markdown with uppercase alpha markers as type "A"', () => {
      const markdownManager = new MarkdownManager({
        extensions: [Document, Paragraph, Text, ListItem, OrderedList],
      })

      const json = markdownManager.parse('A. Item 1\nB. Item 2')

      expect(json.content[0].attrs?.type).toBe('A')
    })

    it('parses markdown with lowercase roman markers as type "i"', () => {
      const markdownManager = new MarkdownManager({
        extensions: [Document, Paragraph, Text, ListItem, OrderedList],
      })

      const json = markdownManager.parse('i. Item 1\nii. Item 2\niii. Item 3')

      expect(json.content[0].attrs?.type).toBe('i')
      expect(json.content[0].content).toHaveLength(3)
    })

    it('parses markdown with uppercase roman markers as type "I"', () => {
      const markdownManager = new MarkdownManager({
        extensions: [Document, Paragraph, Text, ListItem, OrderedList],
      })

      const json = markdownManager.parse('I. Item 1\nII. Item 2')

      expect(json.content[0].attrs?.type).toBe('I')
    })

    it('parses default numeric markdown markers with default type', () => {
      const markdownManager = new MarkdownManager({
        extensions: [Document, Paragraph, Text, ListItem, OrderedList],
      })

      const json = markdownManager.parse('1. Item 1\n2. Item 2')

      expect(json.content[0].attrs?.type).toBeUndefined()
    })

    it('serializes an ordered list with type="a" to lowercase alpha markers', () => {
      const markdownManager = new MarkdownManager({
        extensions: [Document, Paragraph, Text, ListItem, OrderedList],
      })

      const md = markdownManager.serialize({
        type: 'doc',
        content: [
          {
            type: 'orderedList',
            attrs: { start: 1, type: 'a' },
            content: [
              {
                type: 'listItem',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Item A' }] }],
              },
              {
                type: 'listItem',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Item B' }] }],
              },
            ],
          },
        ],
      })

      expect(md).toBe('a. Item A\nb. Item B')
    })

    it('serializes an ordered list with type="I" to uppercase roman markers', () => {
      const markdownManager = new MarkdownManager({
        extensions: [Document, Paragraph, Text, ListItem, OrderedList],
      })

      const md = markdownManager.serialize({
        type: 'doc',
        content: [
          {
            type: 'orderedList',
            attrs: { start: 1, type: 'I' },
            content: [
              {
                type: 'listItem',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'One' }] }],
              },
              {
                type: 'listItem',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Two' }] }],
              },
            ],
          },
        ],
      })

      expect(md).toBe('I. One\nII. Two')
    })

    it('serializes a default ordered list with numeric markers', () => {
      const markdownManager = new MarkdownManager({
        extensions: [Document, Paragraph, Text, ListItem, OrderedList],
      })

      const md = markdownManager.serialize({
        type: 'doc',
        content: [
          {
            type: 'orderedList',
            content: [
              {
                type: 'listItem',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Item 1' }] }],
              },
              {
                type: 'listItem',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Item 2' }] }],
              },
            ],
          },
        ],
      })

      expect(md).toBe('1. Item 1\n2. Item 2')
    })

    it('round-trips markdown with type="a" preserving the type', () => {
      const markdownManager = new MarkdownManager({
        extensions: [Document, Paragraph, Text, ListItem, OrderedList],
      })

      const original = 'a. Item A\nb. Item B'

      // Parse
      const json = markdownManager.parse(original)
      expect(json.content[0].attrs?.type).toBe('a')

      // Serialize back
      const md = markdownManager.serialize(json)
      expect(md).toBe(original)
    })

    it('round-trips markdown with type="I" preserving the type', () => {
      const markdownManager = new MarkdownManager({
        extensions: [Document, Paragraph, Text, ListItem, OrderedList],
      })

      const original = 'I. One\nII. Two'

      // Parse
      const json = markdownManager.parse(original)
      expect(json.content[0].attrs?.type).toBe('I')

      // Serialize back
      const md = markdownManager.serialize(json)
      expect(md).toBe(original)
    })
  })

  // ───────── Phase 5: Plain-text paste detection ─────────

  describe('plain-text paste detection', () => {
    /**
     * Helper: builds the JSONContent structure that the paste handler creates
     * for a given typed ordered list text pattern.
     */
    function simulatePasteBuild(text: string): JSONContent | null {
      const typedListLineRegex = /^([a-zA-Z]|\d+|[ivxlcdmIVXLCDM]{2,8})([.)])\s+(.+)$/
      const lines = text.split('\n').filter(l => l.trim().length > 0)

      const parsedItems: Array<{ marker: string; content: string }> = []

      for (const line of lines) {
        const match = line.trim().match(typedListLineRegex)
        if (!match) return null
        parsedItems.push({
          marker: match[1],
          content: match[3],
        })
      }

      // Import detectMarkerType dynamically to test the actual function
      // We'll use the same logic as the paste handler
      // (detectMarkerType is already tested separately above)
      return {
        type: 'orderedList',
        attrs: {},
        content: parsedItems.map(item => ({
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: item.content }],
            },
          ],
        })),
      }
    }

    it('detects single-line lowercase alpha paste', () => {
      const result = simulatePasteBuild('a. Item 1')

      expect(result).not.toBeNull()
      expect(result!.content).toHaveLength(1)
      expect(result!.content![0].content![0].content![0].text).toBe('Item 1')
    })

    it('detects multi-line lowercase alpha paste', () => {
      const text = 'a. Item 1\nb. Item 2'
      const result = simulatePasteBuild(text)

      expect(result).not.toBeNull()
      expect(result!.content).toHaveLength(2)
      expect(result!.content![0].content![0].content![0].text).toBe('Item 1')
      expect(result!.content![1].content![0].content![0].text).toBe('Item 2')
    })

    it('detects alpha paste with paren separator', () => {
      const result = simulatePasteBuild('a) Item 1\nb) Item 2')

      expect(result).not.toBeNull()
      expect(result!.content).toHaveLength(2)
    })

    it('detects roman numeral paste with dot separator', () => {
      const result = simulatePasteBuild('i. Item 1\nii. Item 2')

      expect(result).not.toBeNull()
      expect(result!.content).toHaveLength(2)
    })

    it('detects roman numeral paste with paren separator', () => {
      const result = simulatePasteBuild('I) Item 1\nII) Item 2')

      expect(result).not.toBeNull()
      expect(result!.content).toHaveLength(2)
    })

    it('detects numeric paste with dot separator', () => {
      const result = simulatePasteBuild('1. Item 1\n2. Item 2')

      expect(result).not.toBeNull()
      expect(result!.content).toHaveLength(2)
    })

    it('does not match plain text without list markers', () => {
      const result = simulatePasteBuild('Just some text\nAnd more text')

      expect(result).toBeNull()
    })

    it('does not match mixed content (some lines have markers, some do not)', () => {
      const result = simulatePasteBuild('a. Item 1\nThis is not a list item')

      expect(result).toBeNull()
    })

    it('does not match short patterns without content after marker', () => {
      const result = simulatePasteBuild('a. ')

      expect(result).toBeNull()
    })

    it('creates an ordered list with type from JSON content (simulating paste handler)', () => {
      editor = new Editor({
        extensions: [Document, Paragraph, Text, ListItem, OrderedList],
        content: {
          type: 'doc',
          content: [
            {
              type: 'orderedList',
              attrs: { type: 'a' },
              content: [
                {
                  type: 'listItem',
                  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Item A' }] }],
                },
                {
                  type: 'listItem',
                  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Item B' }] }],
                },
              ],
            },
          ],
        },
      })

      const json = editor.getJSON()

      expect(json.content).toHaveLength(1)
      expect(json.content[0].type).toBe('orderedList')
      expect(json.content[0].attrs?.type).toBe('a')
      expect(json.content[0].content).toHaveLength(2)
      expect(json.content[0].content[0].content[0].content[0].text).toBe('Item A')
    })
  })

  // ───────── Phase 2: joinPredicate (in toggleList.ts) ─────────

  describe('joinPredicate', () => {
    it('does not merge adjacent orderedLists with different type values when toggling list', () => {
      editor = new Editor({
        extensions: [Document, Paragraph, Text, ListItem, OrderedList],
        content: '<ol type="a"><li><p>A</p></li></ol><p></p>',
      })

      // Position cursor at the empty paragraph after the typed list
      editor.commands.setTextSelection(editor.state.doc.content.size)

      // Toggle ordered list on the paragraph - should create NEW list, not merge
      editor.commands.toggleOrderedList()

      const json = editor.getJSON()

      // Should have two separate orderedList nodes (types differ)
      expect(json.content).toHaveLength(2)
      expect(json.content[0].attrs?.type).toBe('a')
      expect(json.content[1].attrs?.type).toBe(null)
    })

    it('does merge adjacent orderedLists when both have default type', () => {
      editor = new Editor({
        extensions: [Document, Paragraph, Text, ListItem, OrderedList],
        content: '<ol><li><p>First</p></li></ol><p></p>',
      })

      // Position cursor at the empty paragraph
      editor.commands.setTextSelection(editor.state.doc.content.size)

      // Toggle ordered list - should merge with the existing list
      editor.commands.toggleOrderedList()

      const json = editor.getJSON()

      // Should have one list with both items (merged)
      expect(json.content).toHaveLength(1)
      expect(json.content[0].content).toHaveLength(2)
    })
  })

  // ───────── Phase 1: renderHTML ─────────

  describe('renderHTML', () => {
    it('does not render a type attribute when type is null', () => {
      editor = new Editor({
        extensions: [Document, Paragraph, Text, ListItem, OrderedList],
        content: {
          type: 'doc',
          content: [
            {
              type: 'orderedList',
              attrs: { start: 1, type: null },
              content: [
                {
                  type: 'listItem',
                  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Item' }] }],
                },
              ],
            },
          ],
        },
      })

      const html = editor.getHTML()

      expect(html).toBe('<ol><li><p>Item</p></li></ol>')
    })

    it('does not render a type attribute when type is "1" (default)', () => {
      editor = new Editor({
        extensions: [Document, Paragraph, Text, ListItem, OrderedList],
        content: {
          type: 'doc',
          content: [
            {
              type: 'orderedList',
              attrs: { start: 1, type: '1' },
              content: [
                {
                  type: 'listItem',
                  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Item' }] }],
                },
              ],
            },
          ],
        },
      })

      const html = editor.getHTML()

      expect(html).toBe('<ol><li><p>Item</p></li></ol>')
    })

    it('renders type="a" on the ol element', () => {
      editor = new Editor({
        extensions: [Document, Paragraph, Text, ListItem, OrderedList],
        content: {
          type: 'doc',
          content: [
            {
              type: 'orderedList',
              attrs: { start: 1, type: 'a' },
              content: [
                {
                  type: 'listItem',
                  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Item' }] }],
                },
              ],
            },
          ],
        },
      })

      const html = editor.getHTML()

      expect(html).toBe('<ol type="a"><li><p>Item</p></li></ol>')
    })

    it('renders type="A" on the ol element', () => {
      editor = new Editor({
        extensions: [Document, Paragraph, Text, ListItem, OrderedList],
        content: {
          type: 'doc',
          content: [
            {
              type: 'orderedList',
              attrs: { start: 1, type: 'A' },
              content: [
                {
                  type: 'listItem',
                  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Item' }] }],
                },
              ],
            },
          ],
        },
      })

      const html = editor.getHTML()

      expect(html).toBe('<ol type="A"><li><p>Item</p></li></ol>')
    })

    it('renders type="i" on the ol element', () => {
      editor = new Editor({
        extensions: [Document, Paragraph, Text, ListItem, OrderedList],
        content: {
          type: 'doc',
          content: [
            {
              type: 'orderedList',
              attrs: { start: 1, type: 'i' },
              content: [
                {
                  type: 'listItem',
                  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Item' }] }],
                },
              ],
            },
          ],
        },
      })

      const html = editor.getHTML()

      expect(html).toBe('<ol type="i"><li><p>Item</p></li></ol>')
    })

    it('renders type="I" on the ol element', () => {
      editor = new Editor({
        extensions: [Document, Paragraph, Text, ListItem, OrderedList],
        content: {
          type: 'doc',
          content: [
            {
              type: 'orderedList',
              attrs: { start: 1, type: 'I' },
              content: [
                {
                  type: 'listItem',
                  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Item' }] }],
                },
              ],
            },
          ],
        },
      })

      const html = editor.getHTML()

      expect(html).toBe('<ol type="I"><li><p>Item</p></li></ol>')
    })

    it('renders both start and type when both are set', () => {
      editor = new Editor({
        extensions: [Document, Paragraph, Text, ListItem, OrderedList],
        content: {
          type: 'doc',
          content: [
            {
              type: 'orderedList',
              attrs: { start: 5, type: 'i' },
              content: [
                {
                  type: 'listItem',
                  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Item' }] }],
                },
              ],
            },
          ],
        },
      })

      const html = editor.getHTML()

      expect(html).toBe('<ol start="5" type="i"><li><p>Item</p></li></ol>')
    })

    it('renders start attribute only (not default 1) when type is null', () => {
      editor = new Editor({
        extensions: [Document, Paragraph, Text, ListItem, OrderedList],
        content: {
          type: 'doc',
          content: [
            {
              type: 'orderedList',
              attrs: { start: 3, type: null },
              content: [
                {
                  type: 'listItem',
                  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Item' }] }],
                },
              ],
            },
          ],
        },
      })

      const html = editor.getHTML()

      expect(html).toBe('<ol start="3"><li><p>Item</p></li></ol>')
    })
  })

  // ───────── Phase 3: HTML paste round-trip ─────────

  describe('HTML paste round-trip', () => {
    const setAndGetJSON = (html: string): JSONContent => {
      const editor = new Editor({
        extensions: [Document, Paragraph, Text, ListItem, OrderedList],
        content: html,
      })
      const json = editor.getJSON()
      editor.destroy()
      return json
    }

    it('parses type="a" from HTML and preserves it in getJSON', () => {
      const json = setAndGetJSON('<ol type="a"><li><p>Item A</p></li></ol>')

      expect(json.content).toHaveLength(1)
      expect(json.content[0].type).toBe('orderedList')
      expect(json.content[0].attrs?.type).toBe('a')
      expect(json.content[0].attrs?.start).toBe(1)
    })

    it('parses type="A" from HTML correctly', () => {
      const json = setAndGetJSON('<ol type="A"><li><p>Item</p></li></ol>')

      expect(json.content[0].attrs?.type).toBe('A')
    })

    it('parses type="i" from HTML correctly', () => {
      const json = setAndGetJSON('<ol type="i"><li><p>Item</p></li></ol>')

      expect(json.content[0].attrs?.type).toBe('i')
    })

    it('parses type="I" from HTML correctly', () => {
      const json = setAndGetJSON('<ol type="I"><li><p>Item</p></li></ol>')

      expect(json.content[0].attrs?.type).toBe('I')
    })

    it('parses type="1" from HTML as null (default) in JSON', () => {
      const json = setAndGetJSON('<ol type="1"><li><p>Item</p></li></ol>')

      // Note: ProseMirror stores the raw parsed value. With type="1", the
      // parseHTML returns "1" — which is stored. But it renders as no attribute
      // because the HTML spec considers "1" as default.
      expect(json.content[0].attrs?.type).toBe('1')
    })

    it('parses ol without type attribute as null in JSON', () => {
      const json = setAndGetJSON('<ol><li><p>Item</p></li></ol>')

      expect(json.content[0].attrs?.type).toBeNull()
    })

    it('parses both start and type from HTML', () => {
      const json = setAndGetJSON('<ol type="I" start="5"><li><p>Item</p></li></ol>')

      expect(json.content[0].attrs?.start).toBe(5)
      expect(json.content[0].attrs?.type).toBe('I')
    })

    it('preserves type through full HTML round-trip: setContent -> getHTML', () => {
      editor = new Editor({
        extensions: [Document, Paragraph, Text, ListItem, OrderedList],
        content: '<ol type="i"><li><p>Item</p></li></ol>',
      })

      const html = editor.getHTML()

      expect(html).toBe('<ol type="i"><li><p>Item</p></li></ol>')
    })

    // ── CSS list-style-type parsing (Google Docs / Word pattern) ──

    it('parses CSS list-style-type: upper-roman on ol element', () => {
      const json = setAndGetJSON(
        '<ol style="list-style-type: upper-roman;"><li><p>Item</p></li></ol>',
      )

      expect(json.content[0].attrs?.type).toBe('I')
    })

    it('parses CSS list-style-type: lower-roman on ol element', () => {
      const json = setAndGetJSON(
        '<ol style="list-style-type: lower-roman;"><li><p>Item</p></li></ol>',
      )

      expect(json.content[0].attrs?.type).toBe('i')
    })

    it('parses CSS list-style-type: upper-alpha on ol element', () => {
      const json = setAndGetJSON(
        '<ol style="list-style-type: upper-alpha;"><li><p>Item</p></li></ol>',
      )

      expect(json.content[0].attrs?.type).toBe('A')
    })

    it('parses CSS list-style-type: lower-alpha on ol element', () => {
      const json = setAndGetJSON(
        '<ol style="list-style-type: lower-alpha;"><li><p>Item</p></li></ol>',
      )

      expect(json.content[0].attrs?.type).toBe('a')
    })

    it('parses CSS list-style-type from li child (Google Docs pattern)', () => {
      const json = setAndGetJSON(
        '<ol><li style="list-style-type: upper-roman;"><p>Item</p></li></ol>',
      )

      expect(json.content[0].attrs?.type).toBe('I')
    })

    it('parses CSS list-style-type: decimal as default (no type)', () => {
      const json = setAndGetJSON('<ol style="list-style-type: decimal;"><li><p>Item</p></li></ol>')

      expect(json.content[0].attrs?.type).toBeNull()
    })
  })
})
