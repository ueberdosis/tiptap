import { MarkdownManager } from '@tiptap/markdown'
import StarterKit from '@tiptap/starter-kit'
import { describe, expect, test } from 'vitest'

const extensions = [StarterKit]
const manager = new MarkdownManager({ extensions })

describe('Link Extension', () => {
  describe('Markdown', () => {
    test('should parse a link', () => {
      const json = manager.parse(`[Example](https://example.com)`)

      expect(json).toEqual({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Example',
                marks: [
                  {
                    type: 'link',
                    attrs: {
                      href: 'https://example.com',
                      title: null,
                    },
                  },
                ],
              },
            ],
          },
        ],
      })
    })

    test('should parse a link with title', () => {
      const json = manager.parse(`[Example](https://example.com "Title")`)

      expect(json).toEqual({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Example',
                marks: [
                  {
                    type: 'link',
                    attrs: {
                      href: 'https://example.com',
                      title: 'Title',
                    },
                  },
                ],
              },
            ],
          },
        ],
      })
    })

    test('should serialize a link', () => {
      const json = {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Example',
            marks: [
              {
                type: 'link',
                attrs: {
                  href: 'https://example.com',
                  title: null,
                },
              },
            ],
          },
        ],
      }

      const expected = `[Example](https://example.com)`
      expect(manager.serialize(json)).toEqual(expected)
    })

    test('should serialize a link with title', () => {
      const json = {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Example',
            marks: [
              {
                type: 'link',
                attrs: {
                  href: 'https://example.com',
                  title: 'Title',
                },
              },
            ],
          },
        ],
      }

      const expected = `[Example](https://example.com "Title")`
      expect(manager.serialize(json)).toEqual(expected)
    })
  })
})
