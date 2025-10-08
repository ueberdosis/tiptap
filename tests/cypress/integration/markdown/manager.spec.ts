import type { Extension } from '@tiptap/core'
import { createBlockMarkdownSpec, createInlineMarkdownSpec, Node } from '@tiptap/core'
import { Bold } from '@tiptap/extension-bold'
import { Document } from '@tiptap/extension-document'
import { Heading } from '@tiptap/extension-heading'
import { Italic } from '@tiptap/extension-italic'
import { Link } from '@tiptap/extension-link'
import { BulletList, ListItem, OrderedList, TaskItem, TaskList } from '@tiptap/extension-list'
import { Mention } from '@tiptap/extension-mention'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Text } from '@tiptap/extension-text'
import { Youtube } from '@tiptap/extension-youtube'
import { MarkdownManager } from '@tiptap/markdown'

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
  let basicExtensions: Extension[]
  let extendedExtensions: Extension[]

  beforeEach(() => {
    // Basic extensions for standard markdown
    basicExtensions = [Document, Paragraph, Text, Heading, Bold, Italic, Link, BulletList, OrderedList, ListItem]

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

      expect(doc.type).to.equal('doc')
      expect(doc.content).to.be.an('array')
      expect(doc.content[0].type).to.equal('paragraph')
      expect(doc.content[0].content[0].text).to.equal('Hello world')
    })

    it('should parse headings', () => {
      const markdown = `# Heading 1

## Heading 2`
      const doc = markdownManager.parse(markdown)

      expect(doc.content).to.have.length(2)
      expect(doc.content[0].type).to.equal('heading')
      expect(doc.content[0].attrs.level).to.equal(1)
      expect(doc.content[0].content[0].text).to.equal('Heading 1')

      expect(doc.content[1].type).to.equal('heading')
      expect(doc.content[1].attrs.level).to.equal(2)
      expect(doc.content[1].content[0].text).to.equal('Heading 2')
    })

    it('should parse multiple paragraphs', () => {
      const markdown = `First paragraph.

Second paragraph.`
      const doc = markdownManager.parse(markdown)

      expect(doc.content).to.have.length(2)
      expect(doc.content[0].type).to.equal('paragraph')
      expect(doc.content[0].content[0].text).to.equal('First paragraph.')
      expect(doc.content[1].type).to.equal('paragraph')
      expect(doc.content[1].content[0].text).to.equal('Second paragraph.')
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

      expect(doc.content[0].type).to.equal('paragraph')
      expect(doc.content[0].content[0].type).to.equal('mention')
      expect(doc.content[0].content[0].attrs.id).to.equal('user123')
      expect(doc.content[0].content[0].attrs.label).to.equal('John Doe')
      expect(doc.content[0].content[1].text).to.equal(' said hello')
    })

    it('should parse YouTube videos', () => {
      const markdown = ':::youtube {src="https://youtube.com/watch?v=test"}'
      const doc = markdownManager.parse(markdown)

      expect(doc.content[0].type).to.equal('youtube')
      expect(doc.content[0].attrs.src).to.equal('https://youtube.com/watch?v=test')
    })

    it('should handle complex documents with mixed content', () => {
      const markdown = `# Project Title

This is a description with [@ id="user" label="User Name"].

:::youtube {src="https://youtube.com/watch?v=example"}

## Notes

Final paragraph.`

      const doc = markdownManager.parse(markdown)

      expect(doc.content).to.have.length(5)
      expect(doc.content[0].type).to.equal('heading')
      expect(doc.content[1].type).to.equal('paragraph')
      expect(doc.content[1].content[0].type).to.equal('text')
      expect(doc.content[1].content[1].type).to.equal('mention')
      expect(doc.content[2].type).to.equal('youtube')
      expect(doc.content[3].type).to.equal('heading')
      expect(doc.content[4].type).to.equal('paragraph')
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
      expect(markdown).to.equal('Hello world')
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
      expect(markdown).to.equal('# Main Title\n\n## Subtitle')
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
      expect(markdown).to.equal('[@ id="user123" label="John Doe"] said hello')
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
      expect(markdown).to.equal(':::youtube {src="https://youtube.com/watch?v=test"}')
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
        markdown: ':::youtube {src="https://youtube.com/watch?v=test"}',
      },
      {
        name: 'mixed content',
        markdown:
          '# Title\n\nHello [@ id="user" label="User"].\n\n:::youtube {src="https://youtube.com/watch?v=example"}',
      },
    ]

    testCases.forEach(({ name, markdown }) => {
      it(`should round-trip ${name}`, () => {
        const doc = markdownManager.parse(markdown)
        const roundtripMarkdown = markdownManager.renderNodes(doc)

        // Normalize whitespace for comparison
        const normalizeWhitespace = (str: string) => str.replace(/\s+/g, ' ').trim()

        expect(normalizeWhitespace(roundtripMarkdown)).to.equal(normalizeWhitespace(markdown))
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
      expect(simpleDoc.content[0].type).to.equal('paragraph')

      // Test with extended extensions
      const extendedManager = new MarkdownManager()
      extendedExtensions.forEach(ext => extendedManager.registerExtension(ext))

      const complexDoc = extendedManager.parse('# Title\n\n[@ id="user" label="User"]')
      expect(complexDoc.content[0].type).to.equal('heading')
      expect(complexDoc.content[1].content[0].type).to.equal('mention')
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
        expect(doc.content[0].type).to.equal('paragraph')
        expect(doc.content[0].content[0].text).to.equal(markdown)
      })
    })

    it('should validate mention extension markdown specs', () => {
      // Verify that our extensions have proper markdown specs
      const mention = extendedExtensions.find(ext => ext.name === 'mention')
      expect(mention).to.not.equal(undefined)
      expect(mention?.config.markdown).to.not.equal(undefined)
    })

    it('should validate youtube extension markdown specs', () => {
      const youtube = extendedExtensions.find(ext => ext.name === 'youtube')
      expect(youtube).to.not.equal(undefined)
      expect(youtube?.config.markdown).to.not.equal(undefined)
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
      Array.from({ length: 100 }, (_, index) => {
        const i = index + 1
        sections.push(`## Section ${i}`)
        sections.push(`This is paragraph ${i} with some **bold** text.`)
        sections.push(`And mention [@ id="user${i}" label="User ${i}"].`)
        return i
      })
      const largeMarkdown = sections.join('\n\n')

      const startTime = Date.now()
      const doc = markdownManager.parse(largeMarkdown)
      const parseTime = Date.now() - startTime

      const renderStartTime = Date.now()
      const rendered = markdownManager.renderNodes(doc)
      const renderTime = Date.now() - renderStartTime

      // Basic performance expectations (these would need to be tuned)
      expect(parseTime).to.be.lessThan(1000) // Less than 1 second
      expect(renderTime).to.be.lessThan(1000) // Less than 1 second
      expect(doc.content).to.have.length.greaterThan(200) // Should have parsed many nodes
      expect(rendered).to.include('Section 1')
      expect(rendered).to.include('Section 100')
    })

    it('should handle deeply nested content', () => {
      const nestedMarkdown = `# Level 1

:::callout {type="info"}
## Level 2 inside callout

Some text with [@ id="user" label="User"].

:::youtube {src="https://youtube.com/watch?v=test"}
:::`

      const doc = markdownManager.parse(nestedMarkdown)
      const rendered = markdownManager.renderNodes(doc)

      expect(doc.content).to.have.length.greaterThan(1)
      expect(rendered).to.include('Level 1')
      expect(rendered).to.include('Level 2')
    })
  })
})
