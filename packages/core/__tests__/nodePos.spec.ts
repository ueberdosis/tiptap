import { Editor, Node } from '@tiptap/core'
import Blockquote from '@tiptap/extension-blockquote'
import BulletList from '@tiptap/extension-bullet-list'
import Document from '@tiptap/extension-document'
import ListItem from '@tiptap/extension-list-item'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { afterEach, describe, expect, it } from 'vitest'

// Simple inline node for testing (similar to mention)
const CustomInlineNode = Node.create({
  name: 'customInline',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return {
      id: {
        default: null,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="custom-inline"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', { 'data-type': 'custom-inline', ...HTMLAttributes }, 0]
  },
})

describe('NodePos', () => {
  let editor: Editor

  afterEach(() => {
    editor?.destroy()
  })

  describe('$nodes', () => {
    it('should return text nodes', () => {
      editor = new Editor({
        extensions: [Document, Paragraph, Text],
        content: '<p>Hello World</p>',
      })

      const textNodes = editor.$nodes('text')

      expect(textNodes).not.toBeNull()
      expect(textNodes!.length).toBe(1)
      expect(textNodes![0].textContent).toBe('Hello World')
    })

    it('should return multiple text nodes across paragraphs', () => {
      editor = new Editor({
        extensions: [Document, Paragraph, Text],
        content: '<p>First</p><p>Second</p><p>Third</p>',
      })

      const textNodes = editor.$nodes('text')

      expect(textNodes).not.toBeNull()
      expect(textNodes!.length).toBe(3)
      expect(textNodes![0].textContent).toBe('First')
      expect(textNodes![1].textContent).toBe('Second')
      expect(textNodes![2].textContent).toBe('Third')
    })

    it('should return inline atom nodes', () => {
      editor = new Editor({
        extensions: [Document, Paragraph, Text, CustomInlineNode],
        content: '<p>Hello <span data-type="custom-inline" id="1"></span> World</p>',
      })

      const inlineNodes = editor.$nodes('customInline')

      expect(inlineNodes).not.toBeNull()
      expect(inlineNodes!.length).toBe(1)
      expect(inlineNodes![0].node.type.name).toBe('customInline')
    })

    it('should return multiple inline nodes', () => {
      editor = new Editor({
        extensions: [Document, Paragraph, Text, CustomInlineNode],
        content:
          '<p>Hello <span data-type="custom-inline" id="1"></span> and <span data-type="custom-inline" id="2"></span> World</p>',
      })

      const inlineNodes = editor.$nodes('customInline')

      expect(inlineNodes).not.toBeNull()
      expect(inlineNodes!.length).toBe(2)
    })

    it('should return inline nodes with attribute filtering', () => {
      editor = new Editor({
        extensions: [Document, Paragraph, Text, CustomInlineNode],
        content:
          '<p>Hello <span data-type="custom-inline" id="1"></span> and <span data-type="custom-inline" id="2"></span> World</p>',
      })

      // Note: HTML attribute parsing converts numeric strings to numbers
      const inlineNodes = editor.$nodes('customInline', { id: 1 })

      expect(inlineNodes).not.toBeNull()
      expect(inlineNodes!.length).toBe(1)
      expect(inlineNodes![0].node.attrs.id).toBe(1)
    })

    it('should return paragraph nodes', () => {
      editor = new Editor({
        extensions: [Document, Paragraph, Text],
        content: '<p>First</p><p>Second</p>',
      })

      const paragraphNodes = editor.$nodes('paragraph')

      expect(paragraphNodes).not.toBeNull()
      expect(paragraphNodes!.length).toBe(2)
    })

    it('should return inline nodes nested in multiple paragraphs', () => {
      editor = new Editor({
        extensions: [Document, Paragraph, Text, CustomInlineNode],
        content:
          '<p>Para 1 <span data-type="custom-inline" id="1"></span></p><p>Para 2 <span data-type="custom-inline" id="2"></span></p>',
      })

      const inlineNodes = editor.$nodes('customInline')

      expect(inlineNodes).not.toBeNull()
      expect(inlineNodes!.length).toBe(2)
      // Note: HTML attribute parsing converts numeric strings to numbers
      expect(inlineNodes![0].node.attrs.id).toBe(1)
      expect(inlineNodes![1].node.attrs.id).toBe(2)
    })

    it('should find paragraphs inside blockquotes', () => {
      editor = new Editor({
        extensions: [Document, Paragraph, Text, Blockquote],
        content: '<blockquote><p>Quoted text</p></blockquote>',
      })

      const paragraphs = editor.$nodes('paragraph')

      expect(paragraphs).not.toBeNull()
      expect(paragraphs!.length).toBe(1)
      expect(paragraphs![0].textContent).toBe('Quoted text')
    })

    it('should find blockquote nodes', () => {
      editor = new Editor({
        extensions: [Document, Paragraph, Text, Blockquote],
        content: '<blockquote><p>First quote</p></blockquote><p>Normal</p><blockquote><p>Second quote</p></blockquote>',
      })

      const blockquotes = editor.$nodes('blockquote')

      expect(blockquotes).not.toBeNull()
      expect(blockquotes!.length).toBe(2)
    })

    it('should find text nodes inside nested block structures', () => {
      editor = new Editor({
        extensions: [Document, Paragraph, Text, Blockquote],
        content: '<blockquote><p>Quoted</p></blockquote><p>Normal</p>',
      })

      const textNodes = editor.$nodes('text')

      expect(textNodes).not.toBeNull()
      expect(textNodes!.length).toBe(2)
      expect(textNodes![0].textContent).toBe('Quoted')
      expect(textNodes![1].textContent).toBe('Normal')
    })

    it('should find list items in bullet lists', () => {
      editor = new Editor({
        extensions: [Document, Paragraph, Text, BulletList, ListItem],
        content: '<ul><li><p>Item 1</p></li><li><p>Item 2</p></li></ul>',
      })

      const listItems = editor.$nodes('listItem')

      expect(listItems).not.toBeNull()
      expect(listItems!.length).toBe(2)
    })

    it('should find text nodes inside list items', () => {
      editor = new Editor({
        extensions: [Document, Paragraph, Text, BulletList, ListItem],
        content: '<ul><li><p>Item 1</p></li><li><p>Item 2</p></li></ul>',
      })

      const textNodes = editor.$nodes('text')

      expect(textNodes).not.toBeNull()
      expect(textNodes!.length).toBe(2)
      expect(textNodes![0].textContent).toBe('Item 1')
      expect(textNodes![1].textContent).toBe('Item 2')
    })

    it('should find inline nodes inside list items', () => {
      editor = new Editor({
        extensions: [Document, Paragraph, Text, BulletList, ListItem, CustomInlineNode],
        content:
          '<ul><li><p>Item <span data-type="custom-inline" id="1"></span></p></li><li><p>Item <span data-type="custom-inline" id="2"></span></p></li></ul>',
      })

      const inlineNodes = editor.$nodes('customInline')

      expect(inlineNodes).not.toBeNull()
      expect(inlineNodes!.length).toBe(2)
    })

    it('should handle empty paragraphs', () => {
      editor = new Editor({
        extensions: [Document, Paragraph, Text],
        content: '<p></p><p>Content</p><p></p>',
      })

      const paragraphs = editor.$nodes('paragraph')

      expect(paragraphs).not.toBeNull()
      expect(paragraphs!.length).toBe(3)
    })

    it('should return empty array for text nodes when paragraph is empty', () => {
      editor = new Editor({
        extensions: [Document, Paragraph, Text],
        content: '<p></p>',
      })

      const textNodes = editor.$nodes('text')

      expect(textNodes).not.toBeNull()
      expect(textNodes!.length).toBe(0)
    })

    it('should find all node types in mixed content', () => {
      editor = new Editor({
        extensions: [Document, Paragraph, Text, Blockquote, CustomInlineNode],
        content:
          '<p>Normal <span data-type="custom-inline" id="1"></span></p><blockquote><p>Quoted <span data-type="custom-inline" id="2"></span></p></blockquote>',
      })

      const paragraphs = editor.$nodes('paragraph')
      const blockquotes = editor.$nodes('blockquote')
      const textNodes = editor.$nodes('text')
      const inlineNodes = editor.$nodes('customInline')

      expect(paragraphs!.length).toBe(2)
      expect(blockquotes!.length).toBe(1)
      expect(textNodes!.length).toBe(2)
      expect(inlineNodes!.length).toBe(2)
    })
  })

  describe('$node', () => {
    it('should find a single text node', () => {
      editor = new Editor({
        extensions: [Document, Paragraph, Text],
        content: '<p>Hello</p>',
      })

      const textNode = editor.$node('text')

      expect(textNode).not.toBeNull()
      expect(textNode!.textContent).toBe('Hello')
    })

    it('should find a single inline node', () => {
      editor = new Editor({
        extensions: [Document, Paragraph, Text, CustomInlineNode],
        content: '<p><span data-type="custom-inline" id="found"></span></p>',
      })

      const inlineNode = editor.$node('customInline')

      expect(inlineNode).not.toBeNull()
      expect(inlineNode!.node.attrs.id).toBe('found')
    })
  })

  describe('children', () => {
    it('should include text nodes as children of paragraph', () => {
      editor = new Editor({
        extensions: [Document, Paragraph, Text],
        content: '<p>Hello World</p>',
      })

      const paragraph = editor.$node('paragraph')

      expect(paragraph).not.toBeNull()

      const children = paragraph!.children

      expect(children.length).toBe(1)
      expect(children[0].node.type.name).toBe('text')
      expect(children[0].textContent).toBe('Hello World')
    })

    it('should include inline atom nodes as children of paragraph', () => {
      editor = new Editor({
        extensions: [Document, Paragraph, Text, CustomInlineNode],
        content: '<p>Hello <span data-type="custom-inline" id="test"></span> World</p>',
      })

      const paragraph = editor.$node('paragraph')

      expect(paragraph).not.toBeNull()

      const children = paragraph!.children

      // Should have: "Hello ", customInline, " World"
      expect(children.length).toBe(3)
      expect(children[0].node.type.name).toBe('text')
      expect(children[0].textContent).toBe('Hello ')
      expect(children[1].node.type.name).toBe('customInline')
      expect(children[2].node.type.name).toBe('text')
      expect(children[2].textContent).toBe(' World')
    })

    it('should return correct node reference for inline nodes', () => {
      editor = new Editor({
        extensions: [Document, Paragraph, Text, CustomInlineNode],
        content: '<p><span data-type="custom-inline" id="test-id"></span></p>',
      })

      const inlineNodes = editor.$nodes('customInline')

      expect(inlineNodes).not.toBeNull()
      expect(inlineNodes!.length).toBe(1)
      expect(inlineNodes![0].node.attrs.id).toBe('test-id')
    })
  })

  describe('querySelector', () => {
    it('should return first matching node', () => {
      editor = new Editor({
        extensions: [Document, Paragraph, Text, CustomInlineNode],
        content: '<p><span data-type="custom-inline" id="1"></span><span data-type="custom-inline" id="2"></span></p>',
      })

      const paragraph = editor.$node('paragraph')
      const firstInline = paragraph!.querySelector('customInline')

      expect(firstInline).not.toBeNull()
      expect(firstInline!.node.attrs.id).toBe(1)
    })

    it('should return all matching nodes with querySelectorAll', () => {
      editor = new Editor({
        extensions: [Document, Paragraph, Text, CustomInlineNode],
        content: '<p><span data-type="custom-inline" id="1"></span><span data-type="custom-inline" id="2"></span></p>',
      })

      const paragraph = editor.$node('paragraph')
      const allInlines = paragraph!.querySelectorAll('customInline')

      expect(allInlines.length).toBe(2)
    })

    it('should filter correctly with attributes', () => {
      editor = new Editor({
        extensions: [Document, Paragraph, Text, CustomInlineNode],
        content: '<p><span data-type="custom-inline" id="1"></span><span data-type="custom-inline" id="2"></span></p>',
      })

      const paragraph = editor.$node('paragraph')
      const specific = paragraph!.querySelector('customInline', { id: 2 })

      expect(specific).not.toBeNull()
      expect(specific!.node.attrs.id).toBe(2)
    })
  })

  describe('node position properties', () => {
    it('should return correct from/to positions for inline nodes', () => {
      editor = new Editor({
        extensions: [Document, Paragraph, Text, CustomInlineNode],
        content: '<p>Hi <span data-type="custom-inline" id="1"></span> there</p>',
      })

      const inlineNode = editor.$node('customInline')

      expect(inlineNode).not.toBeNull()
      expect(inlineNode!.from).toBeLessThan(inlineNode!.to)
      expect(inlineNode!.size).toBeGreaterThan(0)
    })

    it('should return correct from/to positions for text nodes', () => {
      editor = new Editor({
        extensions: [Document, Paragraph, Text],
        content: '<p>Hello</p>',
      })

      const textNode = editor.$node('text')

      expect(textNode).not.toBeNull()
      expect(textNode!.from).toBeLessThan(textNode!.to)
      expect(textNode!.size).toBe(5) // "Hello" is 5 characters
    })

    it('should return correct range for nodes', () => {
      editor = new Editor({
        extensions: [Document, Paragraph, Text],
        content: '<p>Hello</p>',
      })

      const paragraph = editor.$node('paragraph')

      expect(paragraph).not.toBeNull()
      expect(paragraph!.range.from).toBe(paragraph!.from)
      expect(paragraph!.range.to).toBe(paragraph!.to)
    })
  })

  describe('firstChild and lastChild', () => {
    it('should return correct firstChild for paragraph with text', () => {
      editor = new Editor({
        extensions: [Document, Paragraph, Text],
        content: '<p>Hello World</p>',
      })

      const paragraph = editor.$node('paragraph')
      const firstChild = paragraph!.firstChild

      expect(firstChild).not.toBeNull()
      expect(firstChild!.node.type.name).toBe('text')
      expect(firstChild!.textContent).toBe('Hello World')
    })

    it('should return correct lastChild for paragraph with mixed content', () => {
      editor = new Editor({
        extensions: [Document, Paragraph, Text, CustomInlineNode],
        content: '<p>Hello <span data-type="custom-inline" id="1"></span></p>',
      })

      const paragraph = editor.$node('paragraph')
      const lastChild = paragraph!.lastChild

      expect(lastChild).not.toBeNull()
      expect(lastChild!.node.type.name).toBe('customInline')
    })

    it('should return null for firstChild/lastChild on empty paragraph', () => {
      editor = new Editor({
        extensions: [Document, Paragraph, Text],
        content: '<p></p>',
      })

      const paragraph = editor.$node('paragraph')

      expect(paragraph!.firstChild).toBeNull()
      expect(paragraph!.lastChild).toBeNull()
    })
  })

  describe('parent', () => {
    it('should return parent for paragraph node', () => {
      editor = new Editor({
        extensions: [Document, Paragraph, Text],
        content: '<p>Hello</p>',
      })

      const paragraph = editor.$node('paragraph')
      const parent = paragraph!.parent

      expect(parent).not.toBeNull()
      expect(parent!.node.type.name).toBe('doc')
    })

    it('should return parent for blockquote node', () => {
      editor = new Editor({
        extensions: [Document, Paragraph, Text, Blockquote],
        content: '<blockquote><p>Quoted</p></blockquote>',
      })

      const blockquote = editor.$node('blockquote')
      const parent = blockquote!.parent

      expect(parent).not.toBeNull()
      expect(parent!.node.type.name).toBe('doc')
    })

    it('should return parent for nested paragraph in blockquote', () => {
      editor = new Editor({
        extensions: [Document, Paragraph, Text, Blockquote],
        content: '<blockquote><p>Quoted</p></blockquote>',
      })

      const paragraph = editor.$node('paragraph')
      const parent = paragraph!.parent

      expect(parent).not.toBeNull()
      expect(parent!.node.type.name).toBe('blockquote')
    })
  })

  describe('$doc', () => {
    it('should correctly traverse $doc children', () => {
      editor = new Editor({
        extensions: [Document, Paragraph, Text],
        content: '<p>First</p><p>Second</p>',
      })

      const doc = editor.$doc

      expect(doc).not.toBeNull()
      expect(doc!.children.length).toBe(2)
      expect(doc!.children[0].node.type.name).toBe('paragraph')
      expect(doc!.children[1].node.type.name).toBe('paragraph')
    })

    it('should handle deeply nested structures', () => {
      editor = new Editor({
        extensions: [Document, Paragraph, Text, Blockquote, CustomInlineNode],
        content: '<blockquote><p>Quote with <span data-type="custom-inline" id="deep"></span></p></blockquote>',
      })

      const inlineNode = editor.$node('customInline')

      expect(inlineNode).not.toBeNull()
      expect(inlineNode!.node.attrs.id).toBe('deep')

      // Verify the structure
      const blockquote = editor.$node('blockquote')
      const paragraph = editor.$node('paragraph')

      expect(blockquote).not.toBeNull()
      expect(paragraph).not.toBeNull()
      expect(paragraph!.parent!.node.type.name).toBe('blockquote')
    })
  })
})
