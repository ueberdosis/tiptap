import type { JSONContent } from '@tiptap/core'
import { Editor } from '@tiptap/core'
import Bold from '@tiptap/extension-bold'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { MarkdownManager } from '@tiptap/markdown'
import { afterEach, describe, expect, it } from 'vitest'

import {
  areOrderedListMarkersSequential,
  detectMarkerType,
  getListMarker,
  ListItem,
  markerToStart,
  OrderedList,
  parsePlainTextOrderedListPaste,
} from '../src/index.js'

describe('OrderedList type attribute', () => {
  let editor: Editor

  afterEach(() => {
    editor?.destroy()
  })

  // ───────── Phase 4: Markdown utilities ─────────

  describe('getListMarker', () => {
    it('returns numeric markers for default type', () => {
      expect(getListMarker(null, 0, '. ')).toBe('1. ')
      expect(getListMarker(undefined, 4, '. ')).toBe('5. ')
      expect(getListMarker('1', 0, '. ')).toBe('1. ')
    })

    it('returns lowercase alpha markers for type "a"', () => {
      expect(getListMarker('a', 0, '. ')).toBe('a. ')
      expect(getListMarker('a', 1, '. ')).toBe('b. ')
      expect(getListMarker('a', 25, '. ')).toBe('z. ')
    })

    it('returns uppercase alpha markers for type "A"', () => {
      expect(getListMarker('A', 0, '. ')).toBe('A. ')
      expect(getListMarker('A', 1, '. ')).toBe('B. ')
      expect(getListMarker('A', 25, '. ')).toBe('Z. ')
    })

    it('returns lowercase roman markers for type "i"', () => {
      expect(getListMarker('i', 0, '. ')).toBe('i. ')
      expect(getListMarker('i', 1, '. ')).toBe('ii. ')
      expect(getListMarker('i', 3, '. ')).toBe('iv. ')
      expect(getListMarker('i', 9, '. ')).toBe('x. ')
    })

    it('returns uppercase roman markers for type "I"', () => {
      expect(getListMarker('I', 0, '. ')).toBe('I. ')
      expect(getListMarker('I', 1, '. ')).toBe('II. ')
      expect(getListMarker('I', 3, '. ')).toBe('IV. ')
      expect(getListMarker('I', 9, '. ')).toBe('X. ')
    })
  })

  describe('detectMarkerType', () => {
    it('detects default type for numeric markers', () => {
      expect(detectMarkerType('1')).toBeUndefined()
      expect(detectMarkerType('42')).toBeUndefined()
    })

    it('detects lowercase alpha', () => {
      expect(detectMarkerType('a')).toBe('a')
      expect(detectMarkerType('b')).toBe('a')
      expect(detectMarkerType('z')).toBe('a')
      expect(detectMarkerType('A')).toBe('A')
      expect(detectMarkerType('B')).toBe('A')
    })

    it('does not treat invalid roman strings as roman', () => {
      expect(detectMarkerType('aa')).toBe('a')
    })

    it('does not treat alpha markers longer than 2 letters as alpha', () => {
      expect(detectMarkerType('abc')).toBeUndefined()
      expect(detectMarkerType('ABC')).toBeUndefined()
    })

    it('detects lowercase roman', () => {
      expect(detectMarkerType('i')).toBe('i')
      expect(detectMarkerType('ii')).toBe('i')
      expect(detectMarkerType('iii')).toBe('i')
      expect(detectMarkerType('iv')).toBe('i')
      expect(detectMarkerType('v')).toBe('i')
    })

    it('detects uppercase roman', () => {
      expect(detectMarkerType('I')).toBe('I')
      expect(detectMarkerType('VI')).toBe('I')
      expect(detectMarkerType('X')).toBe('I')
    })
  })

  describe('areOrderedListMarkersSequential', () => {
    it('accepts sequential markers of the same style', () => {
      expect(areOrderedListMarkersSequential(['a', 'b', 'c'])).toBe(true)
      expect(areOrderedListMarkersSequential(['1', '2', '3'])).toBe(true)
      expect(areOrderedListMarkersSequential(['ii', 'iii', 'iv'])).toBe(true)
      expect(areOrderedListMarkersSequential(['b', 'c'])).toBe(true)
    })

    it('rejects mixed styles', () => {
      expect(areOrderedListMarkersSequential(['a', '1'])).toBe(false)
      expect(areOrderedListMarkersSequential(['i', 'ii', 'a'])).toBe(false)
    })

    it('rejects non-sequential markers', () => {
      expect(areOrderedListMarkersSequential(['a', 'c'])).toBe(false)
      expect(areOrderedListMarkersSequential(['1', '3'])).toBe(false)
      expect(areOrderedListMarkersSequential(['II', 'IV'])).toBe(false)
    })
  })

  describe('markerToStart', () => {
    it('parses numeric markers', () => {
      expect(markerToStart('3')).toBe(3)
      expect(markerToStart('42')).toBe(42)
    })

    it('parses alpha markers', () => {
      expect(markerToStart('a')).toBe(1)
      expect(markerToStart('b')).toBe(2)
      expect(markerToStart('aa')).toBe(27)
    })

    it('parses roman markers', () => {
      expect(markerToStart('i')).toBe(1)
      expect(markerToStart('ii')).toBe(2)
      expect(markerToStart('II')).toBe(2)
      expect(markerToStart('IV')).toBe(4)
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
      expect(json.content[0].attrs?.start).toBeUndefined()
      expect(json.content[0].content).toHaveLength(2)
    })

    it('parses markdown with alpha list starting at b', () => {
      const markdownManager = new MarkdownManager({
        extensions: [Document, Paragraph, Text, ListItem, OrderedList],
      })

      const json = markdownManager.parse('b. Item 1\nc. Item 2')

      expect(json.content[0].attrs?.type).toBe('a')
      expect(json.content[0].attrs?.start).toBe(2)
    })

    it('parses markdown with numeric list starting at 3', () => {
      const markdownManager = new MarkdownManager({
        extensions: [Document, Paragraph, Text, ListItem, OrderedList],
      })

      const json = markdownManager.parse('3. Item 1\n4. Item 2')

      expect(json.content[0].attrs?.type).toBeUndefined()
      expect(json.content[0].attrs?.start).toBe(3)
    })

    it('parses markdown with roman list starting at II', () => {
      const markdownManager = new MarkdownManager({
        extensions: [Document, Paragraph, Text, ListItem, OrderedList],
      })

      const json = markdownManager.parse('II. Item 1\nIII. Item 2')

      expect(json.content[0].attrs?.type).toBe('I')
      expect(json.content[0].attrs?.start).toBe(2)
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

    it('keeps the first character of an under-indented continuation line', () => {
      const markdownManager = new MarkdownManager({
        extensions: [Document, Paragraph, Text, ListItem, OrderedList],
      })

      // The continuation line is indented by a single space, fewer columns than the
      // marker width. The leading indentation must be stripped without eating the
      // first real character of the line.
      const json = markdownManager.parse('1. Item one\n continued text')

      const collectText = (node: JSONContent): string =>
        (node.text ?? '') + (node.content ?? []).map(collectText).join('')

      const text = collectText(json.content[0].content[0])

      expect(text).toBe('Item one\ncontinued text')
    })

    it('keeps the first character of an under-indented continuation line for wider markers', () => {
      const markdownManager = new MarkdownManager({
        extensions: [Document, Paragraph, Text, ListItem, OrderedList],
      })

      const collectText = (node: JSONContent): string =>
        (node.text ?? '') + (node.content ?? []).map(collectText).join('')

      const numeric = markdownManager.parse('10. Item ten\n continued text')
      expect(collectText(numeric.content[0].content[0])).toBe('Item ten\ncontinued text')

      const roman = markdownManager.parse('iv. Item four\n continued text')
      expect(collectText(roman.content[0].content[0])).toBe('Item four\ncontinued text')
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

    it('does not parse three-letter alpha markers as a list', () => {
      const markdownManager = new MarkdownManager({
        extensions: [Document, Paragraph, Text, ListItem, OrderedList],
      })

      const json = markdownManager.parse('abc. Not a list')

      expect(json.content[0].type).not.toBe('orderedList')
    })

    it('round-trips multi-letter alpha markers beyond 26 items', () => {
      const markdownManager = new MarkdownManager({
        extensions: [Document, Paragraph, Text, ListItem, OrderedList],
      })

      const original = 'aa. Item 27\nab. Item 28'

      const json = markdownManager.parse(original)
      expect(json.content[0].attrs?.type).toBe('a')
      expect(json.content[0].attrs?.start).toBe(27)

      const md = markdownManager.serialize(json)
      expect(md).toBe(original)
    })

    it('parses inline formatting inside an indented ordered list item', () => {
      // A single leading space before the marker (e.g. a top-level ordered
      // list nested one level inside another list) previously made the
      // custom ordered-list tokenizer bail out silently, falling back to a
      // path that left the item's content as literal, unparsed text.
      const markdownManager = new MarkdownManager({
        extensions: [Document, Paragraph, Text, Bold, ListItem, OrderedList],
      })

      const noIndent = markdownManager.parse('1. **bold** item')
      const indented = markdownManager.parse(' 1. **bold** item')

      expect(indented.content).toEqual(noIndent.content)

      const textNode = indented.content[0].content[0].content[0].content[0]
      expect(textNode.text).toBe('bold')
      expect(textNode.marks?.[0]?.type).toBe('bold')
    })
  })

  // ───────── Phase 5: Plain-text paste detection ─────────

  describe('plain-text paste detection', () => {
    it('detects single-line lowercase alpha paste', () => {
      const result = parsePlainTextOrderedListPaste('a. Item 1')

      expect(result).not.toBeNull()
      expect(result!.attrs?.type).toBe('a')
      expect(result!.attrs?.start).toBeUndefined()
      expect(result!.content).toHaveLength(1)
      expect(result!.content![0].content![0].content![0].text).toBe('Item 1')
    })

    it('detects multi-line lowercase alpha paste', () => {
      const text = 'a. Item 1\nb. Item 2'
      const result = parsePlainTextOrderedListPaste(text)

      expect(result).not.toBeNull()
      expect(result!.attrs?.type).toBe('a')
      expect(result!.content).toHaveLength(2)
      expect(result!.content![0].content![0].content![0].text).toBe('Item 1')
      expect(result!.content![1].content![0].content![0].text).toBe('Item 2')
    })

    it('sets start when pasting alpha list beginning at b', () => {
      const result = parsePlainTextOrderedListPaste('b. Item 1\nc. Item 2')

      expect(result!.attrs?.type).toBe('a')
      expect(result!.attrs?.start).toBe(2)
    })

    it('sets start when pasting numeric list beginning at 3', () => {
      const result = parsePlainTextOrderedListPaste('3. Item 1\n4. Item 2')

      expect(result!.attrs?.type).toBeUndefined()
      expect(result!.attrs?.start).toBe(3)
    })

    it('sets type and start when pasting roman list beginning at II', () => {
      const result = parsePlainTextOrderedListPaste('II. Item 1\nIII. Item 2')

      expect(result!.attrs?.type).toBe('I')
      expect(result!.attrs?.start).toBe(2)
    })

    it('detects alpha paste with paren separator', () => {
      const result = parsePlainTextOrderedListPaste('a) Item 1\nb) Item 2')

      expect(result).not.toBeNull()
      expect(result!.content).toHaveLength(2)
    })

    it('detects roman numeral paste with dot separator', () => {
      const result = parsePlainTextOrderedListPaste('i. Item 1\nii. Item 2')

      expect(result).not.toBeNull()
      expect(result!.content).toHaveLength(2)
    })

    it('detects roman numeral paste with paren separator', () => {
      const result = parsePlainTextOrderedListPaste('I) Item 1\nII) Item 2')

      expect(result).not.toBeNull()
      expect(result!.content).toHaveLength(2)
    })

    it('detects numeric paste with dot separator', () => {
      const result = parsePlainTextOrderedListPaste('1. Item 1\n2. Item 2')

      expect(result).not.toBeNull()
      expect(result!.content).toHaveLength(2)
    })

    it('does not match plain text without list markers', () => {
      const result = parsePlainTextOrderedListPaste('Just some text\nAnd more text')

      expect(result).toBeNull()
    })

    it('does not match mixed content (some lines have markers, some do not)', () => {
      const result = parsePlainTextOrderedListPaste('a. Item 1\nThis is not a list item')

      expect(result).toBeNull()
    })

    it('does not match short patterns without content after marker', () => {
      const result = parsePlainTextOrderedListPaste('a. ')

      expect(result).toBeNull()
    })

    it('does not match three-letter alpha markers', () => {
      const result = parsePlainTextOrderedListPaste('abc. Something')

      expect(result).toBeNull()
    })

    it('does not match non-sequential markers', () => {
      const result = parsePlainTextOrderedListPaste('a. Item 1\nc. Item 3')

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
