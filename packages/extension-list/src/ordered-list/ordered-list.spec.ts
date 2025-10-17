import { generateJSON } from '@tiptap/core'
import { MarkdownManager } from '@tiptap/markdown'
import StarterKit from '@tiptap/starter-kit'
import { describe, expect, test } from 'vitest'

const extensions = [StarterKit]

describe('Ordered List Extension', () => {
  describe('Markdown', () => {
    test('should parse a simple ordered list', () => {
      const manager = new MarkdownManager({ extensions })

      const markdown = `
1. Item 1
2. Item 2
3. Item 3
        `.trim()

      const parsed = manager.parse(markdown)

      expect(parsed).toEqual({
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
              {
                type: 'listItem',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Item 3' }] }],
              },
            ],
          },
        ],
      })
    })

    test('should parse a nested ordered list', () => {
      const manager = new MarkdownManager({ extensions })

      const markdown = `
1. Item 1
2. Item 2
  1. Nested Item 1
    1. Deeply Nested Item 1
  2. Nested Item 2
3. Item 3
  1. Nested Item 3
  2. Nested Item 4
        `.trim()

      const parsed = manager.parse(markdown)

      expect(parsed).toEqual({
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
                content: [
                  { type: 'paragraph', content: [{ type: 'text', text: 'Item 2' }] },
                  {
                    type: 'orderedList',
                    content: [
                      {
                        type: 'listItem',
                        content: [
                          { type: 'paragraph', content: [{ type: 'text', text: 'Nested Item 1' }] },
                          {
                            type: 'orderedList',
                            content: [
                              {
                                type: 'listItem',
                                content: [
                                  { type: 'paragraph', content: [{ type: 'text', text: 'Deeply Nested Item 1' }] },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: 'listItem',
                        content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Nested Item 2' }] }],
                      },
                    ],
                  },
                ],
              },
              {
                type: 'listItem',
                content: [
                  { type: 'paragraph', content: [{ type: 'text', text: 'Item 3' }] },
                  {
                    type: 'orderedList',
                    content: [
                      {
                        type: 'listItem',
                        content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Nested Item 3' }] }],
                      },
                      {
                        type: 'listItem',
                        content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Nested Item 4' }] }],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      })
    })

    test('should parse nested list with mixed types', () => {
      const manager = new MarkdownManager({ extensions })

      const markdown = `
1. Item 1
  - Bullet 1
  - Bullet 2
2. Item 2
        `.trim()

      const parsed = manager.parse(markdown)

      expect(parsed).toEqual({
        type: 'doc',
        content: [
          {
            type: 'orderedList',
            content: [
              {
                type: 'listItem',
                content: [
                  { type: 'paragraph', content: [{ type: 'text', text: 'Item 1' }] },
                  {
                    type: 'bulletList',
                    content: [
                      {
                        type: 'listItem',
                        content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Bullet 1' }] }],
                      },
                      {
                        type: 'listItem',
                        content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Bullet 2' }] }],
                      },
                    ],
                  },
                ],
              },
              {
                type: 'listItem',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Item 2' }] }],
              },
            ],
          },
        ],
      })
    })

    test('should serialize a ordered list', () => {
      const manager = new MarkdownManager({ extensions })

      const html = `
  <ol>
    <li>
      <p>Item 1</p>
    </li>
    <li>
      <p>Item 2</p>
      <ol>
        <li>
          <p>Bullet 1</p>
        </li>
        <li>
          <p>Bullet 2</p>
        </li>
      </ol>
    </li>
  </ol>
      `.trim()

      const json = generateJSON(html, extensions)

      const serialized = manager.serialize(json)

      const expected = `
1. Item 1
2. Item 2
  1. Bullet 1
  2. Bullet 2
      `.trim()

      expect(serialized).toEqual(expected)
    })

    test('should serialize a mixed list', () => {
      const manager = new MarkdownManager({ extensions })

      const html = `
  <ol>
    <li>
      <p>Item 1</p>
    </li>
    <li>
      <p>Item 2</p>
      <ul>
        <li>
          <p>Bullet 1</p>
        </li>
        <li>
          <p>Bullet 2</p>
        </li>
      </ul>
    </li>
  </ol>
      `.trim()

      const json = generateJSON(html, extensions)

      const serialized = manager.serialize(json)

      const expected = `
1. Item 1
2. Item 2
  - Bullet 1
  - Bullet 2
      `.trim()

      expect(serialized).toEqual(expected)
    })
  })
})
