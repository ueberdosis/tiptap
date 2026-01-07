import type { Extension } from '@tiptap/core'
import { Bold } from '@tiptap/extension-bold'
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
    Link,
    Heading,
    HardBreak,
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
      expect(json).toEqual(expectedJSON)
    })

    it('should convert JSON structure back to expected markdown', () => {
      const md = markdownManager.serialize(expectedJSON)
      expect(md).toBe(markdownWithLeadingParagraph)
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
})
