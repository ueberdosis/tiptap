import { Blockquote } from '@tiptap/extension-blockquote'
import { Document } from '@tiptap/extension-document'
import { Heading } from '@tiptap/extension-heading'
import { BulletList, ListItem, OrderedList, TaskItem, TaskList } from '@tiptap/extension-list'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Text } from '@tiptap/extension-text'
import { MarkdownManager } from '@tiptap/markdown'
import { beforeEach, describe, expect, it } from 'vite-plus/test'

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
        TaskList,
        TaskItem,
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

    it('should emit &nbsp; when an empty paragraph is between two bullet lists and preserve them on roundtrip', () => {
      const doc = {
        type: 'doc',
        content: [
          {
            type: 'bulletList',
            content: [
              {
                type: 'listItem',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'list 1' }] }],
              },
              {
                type: 'listItem',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'list 2' }] }],
              },
            ],
          },
          { type: 'paragraph', content: [] },
          {
            type: 'bulletList',
            content: [
              {
                type: 'listItem',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'list 3' }] }],
              },
              {
                type: 'listItem',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'list 4' }] }],
              },
            ],
          },
        ],
      }

      const markdown = markdownManager.serialize(doc)
      expect(markdown).toBe('- list 1\n- list 2\n\n&nbsp;\n\n- list 3\n- list 4')

      const parsed = markdownManager.parse(markdown)
      expect(parsed.content).toHaveLength(3)
      expect(parsed.content![0].type).toBe('bulletList')
      expect(parsed.content![1].type).toBe('paragraph')
      expect(parsed.content![2].type).toBe('bulletList')
    })

    it('should not add phantom empty paragraphs inside list items when parsing loose lists with blank lines', () => {
      const input = '- list 1\n- list 2\n\n\n\n- list 3\n- list 4'
      const parsed = markdownManager.parse(input)
      const list = parsed.content![0]
      expect(list.type).toBe('bulletList')
      // All list items should only have 1 paragraph content, no phantom empty paragraph
      for (const item of list.content!) {
        expect(item.content).toHaveLength(1)
        expect(item.content![0].type).toBe('paragraph')
      }
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

      expect(markdown).toBe('- First\n\n  &nbsp;\n\n  &nbsp;\n\n  Second')
      expect(listItem.type).toBe('listItem')
      expect(listItem.content).toHaveLength(4)
      expect(listItem.content![1].content).toEqual([])
      expect(listItem.content![2].content).toEqual([])
    })

    it('should preserve intentional empty paragraphs inside a list item on roundtrip', () => {
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
                ],
              },
              {
                type: 'listItem',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Second' }] }],
              },
            ],
          },
        ],
      }

      const markdown = markdownManager.serialize(doc)
      expect(markdown).toBe('- First\n\n  &nbsp;\n- Second')

      const parsed = markdownManager.parse(markdown)
      expect(parsed.content![0].type).toBe('bulletList')
      const firstItem = parsed.content![0].content![0]
      expect(firstItem.type).toBe('listItem')
      expect(firstItem.content).toHaveLength(2)
      expect(firstItem.content![0].content![0].text).toBe('First')
      expect(firstItem.content![1].content).toEqual([])

      const secondItem = parsed.content![0].content![1]
      expect(secondItem.type).toBe('listItem')
      expect(secondItem.content).toHaveLength(1)
      expect(secondItem.content![0].content![0].text).toBe('Second')
    })

    it('should preserve intentional empty paragraphs inside an ordered list item on roundtrip', () => {
      const doc = {
        type: 'doc',
        content: [
          {
            type: 'orderedList',
            content: [
              {
                type: 'listItem',
                content: [
                  { type: 'paragraph', content: [{ type: 'text', text: 'Step 1' }] },
                  { type: 'paragraph', content: [] },
                ],
              },
              {
                type: 'listItem',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Step 2' }] }],
              },
            ],
          },
        ],
      }

      const markdown = markdownManager.serialize(doc)
      expect(markdown).toBe('1. Step 1\n\n   &nbsp;\n2. Step 2')

      const parsed = markdownManager.parse(markdown)
      expect(parsed.content![0].type).toBe('orderedList')
      const firstItem = parsed.content![0].content![0]
      expect(firstItem.type).toBe('listItem')
      expect(firstItem.content).toHaveLength(2)
      expect(firstItem.content![0].content![0].text).toBe('Step 1')
      expect(firstItem.content![1].content).toEqual([])

      const secondItem = parsed.content![0].content![1]
      expect(secondItem.type).toBe('listItem')
      expect(secondItem.content).toHaveLength(1)
      expect(secondItem.content![0].content![0].text).toBe('Step 2')
    })

    it('should preserve an empty paragraph between two ordered lists on roundtrip', () => {
      const doc = {
        type: 'doc',
        content: [
          {
            type: 'orderedList',
            content: [
              {
                type: 'listItem',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'List 1 item' }] }],
              },
            ],
          },
          { type: 'paragraph', content: [] },
          {
            type: 'orderedList',
            content: [
              {
                type: 'listItem',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'List 2 item' }] }],
              },
            ],
          },
        ],
      }

      const markdown = markdownManager.serialize(doc)
      expect(markdown).toBe('1. List 1 item\n\n&nbsp;\n\n1. List 2 item')

      const parsed = markdownManager.parse(markdown)
      expect(parsed.content).toHaveLength(3)
      expect(parsed.content![0].type).toBe('orderedList')
      expect(parsed.content![1].type).toBe('paragraph')
      expect(parsed.content![2].type).toBe('orderedList')
    })

    it('should preserve an empty paragraph between a bullet list and an ordered list on roundtrip', () => {
      const doc = {
        type: 'doc',
        content: [
          {
            type: 'bulletList',
            content: [
              {
                type: 'listItem',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Bullet item' }] }],
              },
            ],
          },
          { type: 'paragraph', content: [] },
          {
            type: 'orderedList',
            content: [
              {
                type: 'listItem',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Ordered item' }] }],
              },
            ],
          },
        ],
      }

      const markdown = markdownManager.serialize(doc)
      expect(markdown).toBe('- Bullet item\n\n&nbsp;\n\n1. Ordered item')

      const parsed = markdownManager.parse(markdown)
      expect(parsed.content).toHaveLength(3)
      expect(parsed.content![0].type).toBe('bulletList')
      expect(parsed.content![1].type).toBe('paragraph')
      expect(parsed.content![2].type).toBe('orderedList')
    })

    it('should preserve an intentional empty paragraph before a nested list on roundtrip', () => {
      const doc = {
        type: 'doc',
        content: [
          {
            type: 'bulletList',
            content: [
              {
                type: 'listItem',
                content: [
                  { type: 'paragraph', content: [{ type: 'text', text: 'Parent' }] },
                  { type: 'paragraph', content: [] },
                  {
                    type: 'bulletList',
                    content: [
                      {
                        type: 'listItem',
                        content: [
                          { type: 'paragraph', content: [{ type: 'text', text: 'Child' }] },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      }

      const markdown = markdownManager.serialize(doc)
      expect(markdown).toBe('- Parent\n\n  &nbsp;\n  - Child')

      const parsed = markdownManager.parse(markdown)
      const parentItem = parsed.content![0].content![0]
      expect(parentItem.type).toBe('listItem')
      expect(parentItem.content).toHaveLength(3)
      expect(parentItem.content![0].content![0].text).toBe('Parent')
      expect(parentItem.content![1].content).toEqual([])
      expect(parentItem.content![2].type).toBe('bulletList')
    })

    it('should preserve an empty paragraph between a task list and a bullet list on roundtrip', () => {
      const doc = {
        type: 'doc',
        content: [
          {
            type: 'taskList',
            content: [
              {
                type: 'taskItem',
                attrs: { checked: false },
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Task 1' }] }],
              },
            ],
          },
          { type: 'paragraph', content: [] },
          {
            type: 'bulletList',
            content: [
              {
                type: 'listItem',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Bullet 1' }] }],
              },
            ],
          },
        ],
      }

      const markdown = markdownManager.serialize(doc)
      expect(markdown).toBe('- [ ] Task 1\n\n&nbsp;\n\n- Bullet 1')

      const parsed = markdownManager.parse(markdown)
      expect(parsed.content).toHaveLength(3)
      expect(parsed.content![0].type).toBe('taskList')
      expect(parsed.content![1].type).toBe('paragraph')
      expect(parsed.content![2].type).toBe('bulletList')
    })

    it('should preserve an empty first paragraph in a task item on roundtrip', () => {
      const doc = {
        type: 'doc',
        content: [
          {
            type: 'taskList',
            content: [
              {
                type: 'taskItem',
                attrs: { checked: false },
                content: [
                  { type: 'paragraph', content: [] },
                  { type: 'paragraph', content: [{ type: 'text', text: 'Second' }] },
                ],
              },
            ],
          },
        ],
      }

      const markdown = markdownManager.serialize(doc)
      expect(markdown).toBe('- [ ] &nbsp;\n\n  Second')

      const parsed = markdownManager.parse(markdown)
      expect(parsed.content![0].type).toBe('taskList')
      const taskItem = parsed.content![0].content![0]
      expect(taskItem.type).toBe('taskItem')
      expect(taskItem.content).toHaveLength(2)
      expect(taskItem.content![0].content).toEqual([])
      expect(taskItem.content![1].content![0].text).toBe('Second')
    })
  })
})
