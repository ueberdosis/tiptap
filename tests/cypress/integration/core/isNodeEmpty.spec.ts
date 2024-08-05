/// <reference types="cypress" />

import { getSchema, isNodeEmpty } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Image from '@tiptap/extension-image'
import Mention from '@tiptap/extension-mention'
import StarterKit from '@tiptap/starter-kit'

const schema = getSchema([StarterKit, Mention])
const modifiedSchema = getSchema([
  StarterKit.configure({ document: false }),
  Document.extend({ content: 'heading block*' }),
])
const imageSchema = getSchema([
  StarterKit.configure({ document: false }),
  Document.extend({ content: 'image block*' }),
  Image,
])

describe('isNodeEmpty', () => {
  describe('ignoreWhitespace=true', () => {
    it('should return true when text has only whitespace', () => {
      const node = schema.nodeFromJSON({ type: 'text', text: ' \n\t\r\n' })

      expect(isNodeEmpty(node, { ignoreWhitespace: true })).to.eq(true)
    })

    it('should return true when a paragraph has only whitespace', () => {
      const node = schema.nodeFromJSON({
        type: 'paragraph',
        content: [{ type: 'text', text: ' \n\t\r\n' }],
      })

      expect(isNodeEmpty(node, { ignoreWhitespace: true })).to.eq(true)
    })

    it('should return true for a hardbreak', () => {
      const node = schema.nodeFromJSON({ type: 'hardBreak' })

      expect(isNodeEmpty(node, { ignoreWhitespace: true })).to.eq(true)
    })

    it('should return true when a paragraph has only a hardbreak', () => {
      const node = schema.nodeFromJSON({
        type: 'paragraph',
        content: [{ type: 'hardBreak' }],
      })

      expect(isNodeEmpty(node, { ignoreWhitespace: true })).to.eq(true)
    })
  })

  describe('with default schema', () => {
    it('should return false when text has content', () => {
      const node = schema.nodeFromJSON({ type: 'text', text: 'Hello world!' })

      expect(isNodeEmpty(node)).to.eq(false)
    })

    it('should return false when a paragraph has text', () => {
      const node = schema.nodeFromJSON({
        type: 'paragraph',
        content: [{ type: 'text', text: 'Hello world!' }],
      })

      expect(isNodeEmpty(node)).to.eq(false)
    })

    it('should return false when a paragraph has hardbreaks', () => {
      const node = schema.nodeFromJSON({
        type: 'paragraph',
        content: [{ type: 'hardBreak' }],
      })

      expect(isNodeEmpty(node)).to.eq(false)
    })

    it('should return false when a paragraph has a mention', () => {
      const node = schema.nodeFromJSON({
        type: 'paragraph',
        content: [
          {
            type: 'mention',
            attrs: {
              id: 'Winona Ryder',
              label: null,
            },
          },
        ],
      })

      expect(isNodeEmpty(node)).to.eq(false)
    })

    it('should return true when a paragraph has no content', () => {
      const node = schema.nodeFromJSON({
        type: 'paragraph',
        content: [],
      })

      expect(isNodeEmpty(node)).to.eq(true)
    })

    it('should return true when a paragraph has additional attrs & no content', () => {
      const node = schema.nodeFromJSON({
        type: 'paragraph',
        content: [],
        attrs: {
          id: 'test',
        },
      })

      expect(isNodeEmpty(node)).to.eq(true)
    })

    it('should return true when a paragraph has additional marks & no content', () => {
      const node = schema.nodeFromJSON({
        type: 'paragraph',
        content: [],
        attrs: {
          id: 'test',
        },
        marks: [{ type: 'bold' }],
      })

      expect(isNodeEmpty(node)).to.eq(true)
    })

    it('should return false when a document has text', () => {
      const node = schema.nodeFromJSON({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Hello world!' }],
          },
        ],
      })

      expect(isNodeEmpty(node)).to.eq(false)
    })
    it('should return true when a document has an empty paragraph', () => {
      const node = schema.nodeFromJSON({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [],
          },
        ],
      })

      expect(isNodeEmpty(node)).to.eq(true)
    })
  })

  describe('with modified schema', () => {
    it('should return false when a document has a filled heading', () => {
      const node = modifiedSchema.nodeFromJSON({
        type: 'doc',
        content: [
          {
            type: 'heading',
            content: [{ type: 'text', text: 'Hello world!' }],
          },
        ],
      })

      expect(isNodeEmpty(node)).to.eq(false)
    })

    it('should return false when a document has a filled paragraph', () => {
      const node = modifiedSchema.nodeFromJSON({
        type: 'doc',
        content: [
          { type: 'heading' },
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Hello world!' }],
          },
        ],
      })

      expect(isNodeEmpty(node)).to.eq(false)
    })

    it('should return true when a document has an empty heading', () => {
      const node = modifiedSchema.nodeFromJSON({
        type: 'doc',
        content: [
          { type: 'heading', content: [] },
          { type: 'paragraph', content: [] },
        ],
      })

      expect(isNodeEmpty(node)).to.eq(true)
    })

    it('should return true when a document has an empty heading with attrs', () => {
      const node = modifiedSchema.nodeFromJSON({
        type: 'doc',
        content: [{ type: 'heading', content: [], attrs: { level: 2 } }],
      })

      expect(isNodeEmpty(node)).to.eq(true)
    })

    it('should return true when a document has an empty heading & paragraph', () => {
      const node = modifiedSchema.nodeFromJSON({
        type: 'doc',
        content: [
          { type: 'heading', content: [] },
          { type: 'paragraph', content: [] },
        ],
      })

      expect(isNodeEmpty(node)).to.eq(true)
    })
    it('should return true when a document has an empty heading & paragraph with attributes', () => {
      const node = modifiedSchema.nodeFromJSON({
        type: 'doc',
        content: [
          { type: 'heading', content: [], attrs: { id: 'test' } },
          { type: 'paragraph', content: [], attrs: { id: 'test' } },
        ],
      })

      expect(isNodeEmpty(node)).to.eq(true)
    })

    it('can handle an image node', () => {
      const node = imageSchema.nodeFromJSON({
        type: 'doc',
        content: [
          { type: 'image', attrs: { src: 'https://examples.com' } },
          { type: 'heading', content: [] },
        ],
      })

      expect(isNodeEmpty(node)).to.eq(false)
    })
  })
})
