import type { Extension } from '@tiptap/core'
import { Bold } from '@tiptap/extension-bold'
import { Code } from '@tiptap/extension-code'
import { CodeBlock } from '@tiptap/extension-code-block'
import { Document } from '@tiptap/extension-document'
import { HardBreak } from '@tiptap/extension-hard-break'
import { Heading } from '@tiptap/extension-heading'
import { Italic } from '@tiptap/extension-italic'
import { Link } from '@tiptap/extension-link'
import { BulletList, ListItem, OrderedList, TaskItem, TaskList } from '@tiptap/extension-list'
import { Mention } from '@tiptap/extension-mention'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Text } from '@tiptap/extension-text'
import { Youtube } from '@tiptap/extension-youtube'
import { MarkdownManager } from '@tiptap/markdown'
import { describe, expect, it } from 'vitest'

import * as conversionfiles from './conversion-files/index.js'

describe('Markdown Conversion Tests', () => {
  const extensions = [
    Document,
    Paragraph,
    Text,
    Bold,
    Italic,
    Code,
    Link,
    Heading,
    HardBreak,
    CodeBlock,
    BulletList,
    OrderedList,
    ListItem,
    TaskList,
    TaskItem.configure({
      nested: true,
    }),
    Mention.configure({
      HTMLAttributes: {
        class: 'mention',
      },
      suggestion: undefined,
    }),
    Youtube.configure({
      HTMLAttributes: {
        class: 'youtube-video',
      },
    }),
  ]

  const markdownManager = new MarkdownManager()
  extensions.forEach(extension => {
    markdownManager.registerExtension(extension as Extension)
  })

  const conversionExtensions = [] as Extension[]

  Object.values(conversionfiles).forEach((file: any) => {
    if (!file?.extensions) {
      return
    }

    conversionExtensions.push(...file.extensions)
  })

  conversionExtensions.forEach(extension => {
    markdownManager.registerExtension(extension as Extension)
  })

  describe('convert simple taskList from and to markdown', () => {
    const simpleMarkdown = `
- [ ] Task 1
- [x] Task 2
- [ ] Task 3
`.trim()

    const simpleJSON = {
      type: 'doc',
      content: [
        {
          type: 'taskList',
          content: [
            {
              type: 'taskItem',
              attrs: { checked: false },
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Task 1' }],
                },
              ],
            },
            {
              type: 'taskItem',
              attrs: { checked: true },
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Task 2' }],
                },
              ],
            },
            {
              type: 'taskItem',
              attrs: { checked: false },
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Task 3' }],
                },
              ],
            },
          ],
        },
      ],
    }

    it('should convert simple markdown to expected JSON structure', () => {
      const json = markdownManager.parse(simpleMarkdown)
      expect(json).toEqual(simpleJSON)
    })

    it('should convert simple JSON structure back to expected markdown', () => {
      const md = markdownManager.serialize(simpleJSON)
      expect(md.trim()).toBe(simpleMarkdown.trim())
    })
  })

  describe('convert taskList with leading paragraph from and to markdown', () => {
    const markdownWithLeadingParagraph = `Leading paragraph

- [ ] Task`

    const expectedJSON = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Leading paragraph' }],
        },
        {
          type: 'taskList',
          content: [
            {
              type: 'taskItem',
              attrs: { checked: false },
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Task' }],
                },
              ],
            },
          ],
        },
      ],
    }

    it('should convert markdown with leading paragraph to expected JSON structure', () => {
      const json = markdownManager.parse(markdownWithLeadingParagraph)
      expect(json).to.deep.equal(expectedJSON)
    })

    it('should convert JSON structure back to expected markdown', () => {
      const md = markdownManager.serialize(expectedJSON)
      expect(md).to.equal(markdownWithLeadingParagraph)
    })
  })

  Object.values(conversionfiles).forEach(file => {
    describe(`convert ${file.name} from and to markdown`, () => {
      it(`should convert ${file.name} markdown to expected JSON structure`, () => {
        const json = markdownManager.parse(file.expectedInput)

        const normalizedActual = JSON.parse(JSON.stringify(json))
        const normalizedExpected = JSON.parse(JSON.stringify(file.expectedOutput))

        expect(normalizedActual).toEqual(normalizedExpected)
      })

      it(`should convert ${file.name} JSON structure back to expected markdown`, () => {
        const md = markdownManager.serialize(file.expectedOutput)
        expect(md.trim()).toBe(file.expectedInput.trim())
      })
    })
  })

  describe('multiple empty paragraphs', () => {
    // The first top-level empty paragraph stays empty markdown spacing.
    // Additional consecutive empty paragraphs are preserved with &nbsp; markers.
    it('should preserve two empty paragraphs with blank spacing plus one &nbsp; marker when converting to markdown', () => {
      const json = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Line1' }],
          },
          {
            type: 'paragraph',
            content: [],
          },
          {
            type: 'paragraph',
            content: [],
          },
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Line2' }],
          },
        ],
      }

      const markdown = markdownManager.serialize(json)

      expect(markdown).toBe('Line1\n\n\n\n&nbsp;\n\nLine2')
    })

    it('should parse markdown with one preserved blank paragraph back correctly', () => {
      const markdown = 'Line1\n\n&nbsp;\n\nLine2'
      const json = markdownManager.parse(markdown)
      const content = json.content!

      expect(content).toHaveLength(3)
      expect(content[0].type).toBe('paragraph')
      expect(content[0].content![0].text).toBe('Line1')
      expect(content[1].type).toBe('paragraph')
      expect(content[1].content).toEqual([])
      expect(content[2].type).toBe('paragraph')
      expect(content[2].content![0].text).toBe('Line2')
    })

    it('should reserialize parsed empty paragraphs using blank spacing plus preserved markers', () => {
      const json = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Line1' }],
          },
          {
            type: 'paragraph',
            content: [],
          },
          {
            type: 'paragraph',
            content: [],
          },
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Line2' }],
          },
        ],
      }

      const markdown = markdownManager.serialize(json)
      const parsed = markdownManager.parse(markdown)
      const content = parsed.content!

      expect(content).toHaveLength(4)
      expect(content[1].content).toEqual([])
      expect(content[2].content).toEqual([])

      const remarked = markdownManager.serialize(parsed)
      expect(remarked).toBe(markdown)
    })

    it('should roundtrip five consecutive empty paragraphs without losing one', () => {
      const json = {
        type: 'doc',
        content: [
          { type: 'paragraph', content: [{ type: 'text', text: 'Line1' }] },
          { type: 'paragraph', content: [] },
          { type: 'paragraph', content: [] },
          { type: 'paragraph', content: [] },
          { type: 'paragraph', content: [] },
          { type: 'paragraph', content: [] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Line2' }] },
        ],
      }

      const markdown = markdownManager.serialize(json)
      const parsed = markdownManager.parse(markdown)
      const content = parsed.content!

      expect(markdown).toBe('Line1\n\n\n\n&nbsp;\n\n&nbsp;\n\n&nbsp;\n\n&nbsp;\n\nLine2')
      expect(content).toHaveLength(7)
      expect(content.slice(1, 6).every(node => node.type === 'paragraph' && node.content?.length === 0)).toBe(true)
    })

    it('should handle empty paragraphs without content field (real editor output)', () => {
      // Real editor output may omit the content field for empty paragraphs
      const json = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Line1' }],
          },
          {
            type: 'paragraph',
            // No content field - this is what the real editor might output
          },
          {
            type: 'paragraph',
            // No content field
          },
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Line2' }],
          },
        ],
      }

      const markdown = markdownManager.serialize(json)

      expect(markdown).toBe('Line1\n\n\n\n&nbsp;\n\nLine2')
    })

    it('should parse literal NBSP character (\\u00A0) as empty paragraph', () => {
      // Some markdown parsers may convert &nbsp; entity to the literal NBSP character
      const markdown = 'Line1\n\n\u00A0\n\nLine2'
      const json = markdownManager.parse(markdown)
      const content = json.content!

      expect(content).toHaveLength(3)
      expect(content[0].type).toBe('paragraph')
      expect(content[0].content![0].text).toBe('Line1')
      expect(content[1].type).toBe('paragraph')
      expect(content[1].content).toEqual([])
      expect(content[2].type).toBe('paragraph')
      expect(content[2].content![0].text).toBe('Line2')

      const serialized = markdownManager.serialize(json)
      expect(serialized).toBe('Line1\n\n\n\nLine2')
    })
  })

  describe('tilde fenced code blocks', () => {
    const codeBlockJSON = {
      type: 'doc',
      content: [
        {
          type: 'codeBlock',
          attrs: { language: null },
          content: [{ type: 'text', text: 'code block' }],
        },
      ],
    }

    const codeBlockWithLangJSON = {
      type: 'doc',
      content: [
        {
          type: 'codeBlock',
          attrs: { language: 'js' },
          content: [{ type: 'text', text: 'console.log("hello")' }],
        },
      ],
    }

    it('should parse tilde fenced code blocks', () => {
      const markdown = '~~~\ncode block\n~~~'
      const json = markdownManager.parse(markdown)
      expect(json).toEqual(codeBlockJSON)
    })

    it('should parse tilde fenced code blocks with language', () => {
      const markdown = '~~~js\nconsole.log("hello")\n~~~'
      const json = markdownManager.parse(markdown)
      expect(json).toEqual(codeBlockWithLangJSON)
    })

    it('should parse backtick fenced code blocks', () => {
      const markdown = '```\ncode block\n```'
      const json = markdownManager.parse(markdown)
      expect(json).toEqual(codeBlockJSON)
    })

    it('should parse backtick fenced code blocks with language', () => {
      const markdown = '```js\nconsole.log("hello")\n```'
      const json = markdownManager.parse(markdown)
      expect(json).toEqual(codeBlockWithLangJSON)
    })

    it('should produce the same result for tilde and backtick fenced code blocks', () => {
      const tildeMarkdown = '~~~\ncode block\n~~~'
      const backtickMarkdown = '```\ncode block\n```'
      const tildeJSON = markdownManager.parse(tildeMarkdown)
      const backtickJSON = markdownManager.parse(backtickMarkdown)
      expect(tildeJSON).toEqual(backtickJSON)
    })
  })

  describe('HTML character escaping', () => {
    it('should decode &lt; and &gt; entities to literal < and > when parsing', () => {
      const markdown = 'foo &lt;bar&gt; baz'
      const json = markdownManager.parse(markdown)

      expect(json.content).toHaveLength(1)
      expect(json.content[0].type).toBe('paragraph')
      expect(json.content[0].content).toHaveLength(1)
      expect(json.content[0].content[0].text).toBe('foo <bar> baz')
    })

    it('should decode &amp; entity to literal & when parsing', () => {
      const markdown = 'foo &amp; bar'
      const json = markdownManager.parse(markdown)

      expect(json.content[0].content[0].text).toBe('foo & bar')
    })

    it('should encode < and > back to entities when serializing', () => {
      const json = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'foo <bar> baz' }],
          },
        ],
      }

      const markdown = markdownManager.serialize(json)
      expect(markdown).toBe('foo &lt;bar&gt; baz')
    })

    it('should encode & back to &amp; when serializing', () => {
      const json = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'foo & bar' }],
          },
        ],
      }

      const markdown = markdownManager.serialize(json)
      expect(markdown).toBe('foo &amp; bar')
    })

    it('should roundtrip &lt;bar&gt; correctly', () => {
      const markdown = 'foo &lt;bar&gt; baz'
      const json = markdownManager.parse(markdown)

      // Editor should show literal <bar>
      expect(json.content[0].content[0].text).toBe('foo <bar> baz')

      // Serialize back should produce the entity form
      const serialized = markdownManager.serialize(json)
      expect(serialized).toBe('foo &lt;bar&gt; baz')
    })

    it('should roundtrip &amp; correctly', () => {
      const markdown = 'foo &amp; bar'
      const json = markdownManager.parse(markdown)
      expect(json.content[0].content[0].text).toBe('foo & bar')

      const serialized = markdownManager.serialize(json)
      expect(serialized).toBe('foo &amp; bar')
    })

    it('should decode &quot; entity to literal " when parsing', () => {
      const markdown = 'foo &quot;bar&quot; baz'
      const json = markdownManager.parse(markdown)

      expect(json.content[0].content[0].text).toBe('foo "bar" baz')
    })

    it('should not encode " when serializing (quotes are valid markdown)', () => {
      const json = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'foo "bar" baz' }],
          },
        ],
      }

      const markdown = markdownManager.serialize(json)
      expect(markdown).toBe('foo "bar" baz')
    })

    it('should decode &quot; when parsing but serialize as literal "', () => {
      const markdown = 'foo &quot;bar&quot; baz'
      const json = markdownManager.parse(markdown)
      expect(json.content[0].content[0].text).toBe('foo "bar" baz')

      const serialized = markdownManager.serialize(json)
      expect(serialized).toBe('foo "bar" baz')
    })

    it('should not encode entities inside code blocks', () => {
      const json = {
        type: 'doc',
        content: [
          {
            type: 'codeBlock',
            attrs: { language: null },
            content: [{ type: 'text', text: 'foo <bar> & baz' }],
          },
        ],
      }

      const markdown = markdownManager.serialize(json)
      expect(markdown).toBe('```\nfoo <bar> & baz\n```')
    })

    it('should not encode entities inside inline code marks', () => {
      const json = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: '<tag>',
                marks: [{ type: 'code' }],
              },
            ],
          },
        ],
      }

      const markdown = markdownManager.serialize(json)
      expect(markdown).toBe('`<tag>`')
    })

    it('should handle doubly-encoded entities correctly', () => {
      // &amp;lt; should decode to &lt; (not to <)
      const markdown = 'foo &amp;lt; bar'
      const json = markdownManager.parse(markdown)
      expect(json.content[0].content[0].text).toBe('foo &lt; bar')

      // Serializing should re-encode the & in &lt;
      const serialized = markdownManager.serialize(json)
      expect(serialized).toBe('foo &amp;lt; bar')
    })

    it('should preserve &nbsp; empty paragraph behavior', () => {
      const markdown = 'Line1\n\n&nbsp;\n\nLine2'
      const json = markdownManager.parse(markdown)

      // Empty paragraph check should still work
      expect(json.content).toHaveLength(3)
      expect(json.content[1].type).toBe('paragraph')
      expect(json.content[1].content).toEqual([])

      // A single empty paragraph between content paragraphs uses blank-line
      // spacing (the first empty paragraph doesn't need an &nbsp; marker).
      const serialized = markdownManager.serialize(json)
      expect(serialized).toBe('Line1\n\n\n\nLine2')
    })

    it('should roundtrip literal &amp;nbsp; without it being treated as an empty paragraph marker', () => {
      // A user writing &amp;nbsp; in markdown intends for the text "&nbsp;" to display.
      // decodeHtmlEntities decodes &amp; → &, producing text content "&nbsp;".
      // On serialization, encodeHtmlEntities re-encodes & → &amp;, restoring &amp;nbsp;.
      // The intermediate "&nbsp;" text must NOT be confused with the empty-paragraph marker.
      const markdown = 'before &amp;nbsp; after'
      const json = markdownManager.parse(markdown)

      expect(json.content).toHaveLength(1)
      expect(json.content[0].type).toBe('paragraph')
      expect(json.content[0].content[0].text).toBe('before &nbsp; after')

      const serialized = markdownManager.serialize(json)
      expect(serialized).toBe('before &amp;nbsp; after')
    })

    it('should preserve a standalone literal &amp;nbsp; paragraph as text', () => {
      const markdown = '&amp;nbsp;'
      const json = markdownManager.parse(markdown)
      const content = json.content!

      expect(content).toHaveLength(1)
      expect(content[0].type).toBe('paragraph')
      expect(content[0].content).toEqual([{ type: 'text', text: '&nbsp;' }])

      const serialized = markdownManager.serialize(json)
      expect(serialized).toBe('&amp;nbsp;')
    })
  })
})
