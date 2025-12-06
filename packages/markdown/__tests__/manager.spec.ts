import { type AnyExtension, createBlockMarkdownSpec, createInlineMarkdownSpec, Node } from '@tiptap/core'
import { Bold } from '@tiptap/extension-bold'
import { Document } from '@tiptap/extension-document'
import { Heading } from '@tiptap/extension-heading'
import { Italic } from '@tiptap/extension-italic'
import { Link } from '@tiptap/extension-link'
import { BulletList, ListItem, OrderedList, TaskItem, TaskList } from '@tiptap/extension-list'
import { Mention } from '@tiptap/extension-mention'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Strike } from '@tiptap/extension-strike'
import { Text } from '@tiptap/extension-text'
import { Youtube } from '@tiptap/extension-youtube'
import { MarkdownManager } from '@tiptap/markdown'
import { beforeEach, describe, expect, it } from 'vitest'

// Create test extensions
const TestCallout = Node.create({
  name: 'callout',
  group: 'block',
  content: 'block+',
  defining: true,

  addAttributes() {
    return {
      type: {
        default: 'info',
      },
    }
  },

  ...createBlockMarkdownSpec({
    nodeName: 'callout',
    allowedAttributes: ['type'],
  }),
})

const TestTag = Node.create({
  name: 'tag',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return {
      label: {
        type: null,
      },
    }
  },

  ...createInlineMarkdownSpec({
    nodeName: 'tag',
    selfClosing: true,
    allowedAttributes: ['label'],
  }),
})

describe('MarkdownManager Direct Tests', () => {
  let markdownManager: MarkdownManager
  let basicExtensions: AnyExtension[]
  let extendedExtensions: AnyExtension[]

  beforeEach(() => {
    // Basic extensions for standard markdown
    basicExtensions = [
      Document,
      Paragraph,
      Text,
      Heading,
      Bold,
      Italic,
      Strike,
      Link,
      BulletList,
      OrderedList,
      ListItem,
    ]

    // Extended extensions with custom markdown features
    extendedExtensions = [
      ...basicExtensions,
      TaskList,
      TaskItem,
      Mention.configure({
        HTMLAttributes: {
          class: 'mention',
        },
      }),
      Youtube.configure({
        width: 640,
        height: 360,
      }),
      TestCallout,
      TestTag,
    ]
  })

  describe('Basic Markdown Parsing', () => {
    beforeEach(() => {
      markdownManager = new MarkdownManager()

      basicExtensions.forEach(ext => markdownManager.registerExtension(ext))
    })

    it('should parse simple text', () => {
      const markdown = 'Hello world'
      const doc = markdownManager.parse(markdown)

      expect(doc.type).toBe('doc')
      expect(Array.isArray(doc.content)).toBe(true)
      expect(doc.content![0].type).toBe('paragraph')
      expect(doc.content![0].content![0].text).toBe('Hello world')
    })

    it('should parse headings', () => {
      const markdown = `# Heading 1

## Heading 2`
      const doc = markdownManager.parse(markdown)

      expect(doc.content).toHaveLength(2)
      expect(doc.content![0].type).toBe('heading')
      expect(doc.content![0].attrs!.level).toBe(1)
      expect(doc.content![0].content![0].text).toBe('Heading 1')

      expect(doc.content![1].type).toBe('heading')
      expect(doc.content![1].attrs!.level).toBe(2)
      expect(doc.content![1].content![0].text).toBe('Heading 2')
    })

    it('should parse multiple paragraphs', () => {
      const markdown = `First paragraph.

Second paragraph.`
      const doc = markdownManager.parse(markdown)

      expect(doc.content).toHaveLength(2)
      expect(doc.content![0].type).toBe('paragraph')
      expect(doc.content![0].content![0].text).toBe('First paragraph.')
      expect(doc.content![1].type).toBe('paragraph')
      expect(doc.content![1].content![0].text).toBe('Second paragraph.')
    })
  })

  describe('Extended Markdown Parsing', () => {
    beforeEach(() => {
      markdownManager = new MarkdownManager()
      extendedExtensions.forEach(ext => markdownManager.registerExtension(ext))
    })

    it('should parse mentions', () => {
      const markdown = '[@ id="user123" label="John Doe"] said hello'
      const doc = markdownManager.parse(markdown)

      expect(doc.content![0].type).toBe('paragraph')
      expect(doc.content![0].content![0].type).toBe('mention')
      expect(doc.content![0].content![0].attrs!.id).toBe('user123')
      expect(doc.content![0].content![0].attrs!.label).toBe('John Doe')
      expect(doc.content![0].content![1].text).toBe(' said hello')
    })

    it('should parse YouTube videos', () => {
      const markdown = ':::youtube {src="https://youtube.com/watch?v=test"} :::'
      const doc = markdownManager.parse(markdown)

      expect(doc.content![0].type).toBe('youtube')
      expect(doc.content![0].attrs!.src).toBe('https://youtube.com/watch?v=test')
    })

    it('should handle complex documents with mixed content', () => {
      const markdown = `# Project Title

This is a description with [@ id="user" label="User Name"].

:::youtube {src="https://youtube.com/watch?v=example"} :::

## Notes

Final paragraph.`

      const doc = markdownManager.parse(markdown)

      expect(doc.content).toHaveLength(5)
      expect(doc.content![0].type).toBe('heading')
      expect(doc.content![1].type).toBe('paragraph')
      expect(doc.content![1].content![0].type).toBe('text')
      expect(doc.content![1].content![1].type).toBe('mention')
      expect(doc.content![2].type).toBe('youtube')
      expect(doc.content![3].type).toBe('heading')
      expect(doc.content![4].type).toBe('paragraph')
    })
  })

  describe('Markdown Rendering', () => {
    beforeEach(() => {
      markdownManager = new MarkdownManager()
      extendedExtensions.forEach(ext => markdownManager.registerExtension(ext))
    })

    it('should render simple text', () => {
      const doc = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Hello world' }],
          },
        ],
      }

      const markdown = markdownManager.renderNodes(doc)
      expect(markdown).toBe('Hello world')
    })

    it('should move trailing whitespace outside of mark closing (Issue #7180)', () => {
      // When text has trailing space and bold mark, output should be "**text** " not "**text **"
      const doc = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'bold text ',
                marks: [{ type: 'bold' }],
              },
              {
                type: 'text',
                text: 'continues here',
              },
            ],
          },
        ],
      }

      const markdown = markdownManager.renderNodes(doc)
      // The trailing space should be outside the ** markers
      expect(markdown).toBe('**bold text** continues here')
    })

    it('should move leading whitespace outside of mark opening (Issue #7180)', () => {
      // When text has leading space and bold mark, output should be " **text**" not "** text**"
      const doc = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'normal text',
              },
              {
                type: 'text',
                text: ' bold text',
                marks: [{ type: 'bold' }],
              },
            ],
          },
        ],
      }

      const markdown = markdownManager.renderNodes(doc)
      // The leading space should be outside the ** markers
      expect(markdown).toBe('normal text **bold text**')
    })

    it('should handle both leading and trailing whitespace in marked text (Issue #7180)', () => {
      // Text like " bold " with bold mark should output " **bold** " not "** bold **"
      const doc = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'before',
              },
              {
                type: 'text',
                text: ' bold ',
                marks: [{ type: 'bold' }],
              },
              {
                type: 'text',
                text: 'after',
              },
            ],
          },
        ],
      }

      const markdown = markdownManager.renderNodes(doc)
      // Both leading and trailing spaces should be outside the ** markers
      expect(markdown).toBe('before **bold** after')
    })

    it('should handle trailing whitespace in italic marks (Issue #7180)', () => {
      const doc = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'italic text ',
                marks: [{ type: 'italic' }],
              },
              {
                type: 'text',
                text: 'normal',
              },
            ],
          },
        ],
      }

      const markdown = markdownManager.renderNodes(doc)
      expect(markdown).toBe('*italic text* normal')
    })

    it('should handle whitespace at end of paragraph with mark (Issue #7180)', () => {
      // Bold text with trailing space at end of paragraph
      const doc = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'some text ',
                marks: [{ type: 'bold' }],
              },
            ],
          },
        ],
      }

      const markdown = markdownManager.renderNodes(doc)
      // Trailing space should be outside the marks
      expect(markdown).toBe('**some text** ')
    })

    it('should render nested marks with correct tag order', () => {
      // Test case: bold inside strike should render as ~~**text**~~
      const doc = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Test: ',
                marks: [],
              },
              {
                type: 'text',
                text: 'abcd',
                marks: [
                  { type: 'bold' }, // Opens first: **
                  { type: 'strike' }, // Opens second: ~
                ],
              },
              {
                type: 'text',
                text: ' end.',
                marks: [],
              },
            ],
          },
        ],
      }

      const docAtEnd = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'abcd',
                marks: [
                  { type: 'bold' }, // Opens first: **
                  { type: 'strike' }, // Opens second: ~
                ],
              },
            ],
          },
        ],
      }

      expect(markdownManager.renderNodes(doc)).toBe('Test: ~~**abcd**~~ end.')
      expect(markdownManager.renderNodes(docAtEnd)).toBe('~~**abcd**~~')
    })

    it('should render headings', () => {
      const doc = {
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 1 },
            content: [{ type: 'text', text: 'Main Title' }],
          },
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: 'Subtitle' }],
          },
        ],
      }

      const markdown = markdownManager.renderNodes(doc)
      expect(markdown).toBe('# Main Title\n\n## Subtitle')
    })

    it('should render mentions', () => {
      const doc = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'mention',
                attrs: { id: 'user123', label: 'John Doe' },
              },
              { type: 'text', text: ' said hello' },
            ],
          },
        ],
      }

      const markdown = markdownManager.renderNodes(doc)
      expect(markdown).toBe('[@ id="user123" label="John Doe"] said hello')
    })

    it('should render YouTube videos', () => {
      const doc = {
        type: 'doc',
        content: [
          {
            type: 'youtube',
            attrs: { src: 'https://youtube.com/watch?v=test' },
          },
        ],
      }

      const markdown = markdownManager.renderNodes(doc)
      expect(markdown).toBe(':::youtube {src="https://youtube.com/watch?v=test"} :::')
    })
  })

  describe('Round-trip Tests', () => {
    beforeEach(() => {
      markdownManager = new MarkdownManager()
      extendedExtensions.forEach(ext => markdownManager.registerExtension(ext))
    })

    const testCases = [
      {
        name: 'simple text',
        markdown: 'Hello world',
      },
      {
        name: 'headings',
        markdown: '# Main Title\n\n## Subtitle',
      },
      {
        name: 'mention',
        markdown: '[@ id="user123" label="John Doe"] said hello',
      },
      {
        name: 'youtube video',
        markdown: ':::youtube {src="https://youtube.com/watch?v=test"} :::',
      },
      {
        name: 'mixed content',
        markdown:
          '# Title\n\nHello [@ id="user" label="User"].\n\n:::youtube {src="https://youtube.com/watch?v=example"} :::',
      },
    ]

    testCases.forEach(({ name, markdown }) => {
      it(`should round-trip ${name}`, () => {
        const doc = markdownManager.parse(markdown)
        const roundtripMarkdown = markdownManager.renderNodes(doc)

        // Normalize whitespace for comparison
        const normalizeWhitespace = (str: string) => str.replace(/\s+/g, ' ').trim()

        expect(normalizeWhitespace(roundtripMarkdown)).toBe(normalizeWhitespace(markdown))
      })
    })
  })

  describe('Extension Integration', () => {
    it('should work with different extension combinations', () => {
      // Test with minimal extensions
      const minimalExtensions = [Document, Paragraph, Text]
      const minimalManager = new MarkdownManager()
      minimalExtensions.forEach(ext => minimalManager.registerExtension(ext))

      const simpleDoc = minimalManager.parse('Hello world')
      expect(simpleDoc.content![0].type).toBe('paragraph')

      // Test with extended extensions
      const extendedManager = new MarkdownManager()
      extendedExtensions.forEach(ext => extendedManager.registerExtension(ext))

      const complexDoc = extendedManager.parse('# Title\n\n[@ id="user" label="User"]')
      expect(complexDoc.content![0].type).toBe('heading')
      expect(complexDoc.content![1].content![0].type).toBe('mention')
    })

    it('should handle unknown markdown gracefully', () => {
      const manager = new MarkdownManager()
      basicExtensions.forEach(ext => manager.registerExtension(ext))

      // Test various unknown markdown patterns that should be preserved as text
      const testCases = [
        'Hello [unknown syntax] world',
        'Text with [custom element] here',
        'Some [shortcode attr="value"] content',
        'Using [component prop="test"] in text',
      ]

      testCases.forEach(markdown => {
        const doc = manager.parse(markdown)

        // Should treat it as regular text since it's not recognized markdown
        expect(doc.content![0].type).toBe('paragraph')
        expect(doc.content![0].content![0].text).toBe(markdown)
      })
    })
  })

  describe('Performance Tests', () => {
    beforeEach(() => {
      markdownManager = new MarkdownManager()
      extendedExtensions.forEach(ext => markdownManager.registerExtension(ext))
    })

    it('should handle large documents efficiently', () => {
      // Generate a large markdown document
      const sections = []
      for (let i = 1; i <= 100; i += 1) {
        sections.push(`## Section ${i}`)
        sections.push(`This is paragraph ${i} with some **bold** text.`)
        sections.push(`And mention [@ id="user${i}" label="User ${i}"].`)
      }
      const largeMarkdown = sections.join('\n\n')

      const startTime = Date.now()
      const doc = markdownManager.parse(largeMarkdown)
      const parseTime = Date.now() - startTime

      const renderStartTime = Date.now()
      const rendered = markdownManager.renderNodes(doc)
      const renderTime = Date.now() - renderStartTime

      // Basic performance expectations (these would need to be tuned)
      expect(parseTime).toBeLessThan(1000) // Less than 1 second
      expect(renderTime).toBeLessThan(1000) // Less than 1 second
      expect(doc.content!.length).toBeGreaterThan(200) // Should have parsed many nodes
      expect(rendered).toContain('Section 1')
      expect(rendered).toContain('Section 100')
    })

    it('should handle deeply nested content', () => {
      const nestedMarkdown = `# Level 1

:::callout {type="info"}
## Level 2 inside callout

Some text with [@ id="user" label="User"].

:::youtube {src="https://youtube.com/watch?v=test"} :::
:::`

      const doc = markdownManager.parse(nestedMarkdown)
      const rendered = markdownManager.renderNodes(doc)

      expect(doc.content!.length).toBeGreaterThan(1)
      expect(rendered).toContain('Level 1')
      expect(rendered).toContain('Level 2')
    })
  })
})
