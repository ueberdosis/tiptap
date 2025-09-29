import type { Extension } from '@tiptap/core'
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

describe('Markdown Conversion Tests', () => {
  const extensions = [
    Document,
    Paragraph,
    Text,
    Bold,
    Italic,
    Link,
    Heading,
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
      suggestion: null,
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
      expect(json).to.deep.equal(simpleJSON)
    })

    it('should convert simple JSON structure back to expected markdown', () => {
      const md = markdownManager.serialize(simpleJSON)
      expect(md.trim()).to.equal(simpleMarkdown.trim())
    })
  })

  describe('convert nested taskList from and to markdown', () => {
    const expectedMarkdown = `
- [ ] Task 1
- [x] Task 2
- [ ] Task 3
  - [ ] Subtask 1
  - [x] Subtask 2
    - [ ] Subtask 2a
    - [x] Subtask 2b
- [x] Task 4
`.trim()

    const expectedJSON = {
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
                {
                  type: 'taskList',
                  content: [
                    {
                      type: 'taskItem',
                      attrs: { checked: false },
                      content: [
                        {
                          type: 'paragraph',
                          content: [{ type: 'text', text: 'Subtask 1' }],
                        },
                      ],
                    },
                    {
                      type: 'taskItem',
                      attrs: { checked: true },
                      content: [
                        {
                          type: 'paragraph',
                          content: [{ type: 'text', text: 'Subtask 2' }],
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
                                  content: [{ type: 'text', text: 'Subtask 2a' }],
                                },
                              ],
                            },
                            {
                              type: 'taskItem',
                              attrs: { checked: true },
                              content: [
                                {
                                  type: 'paragraph',
                                  content: [{ type: 'text', text: 'Subtask 2b' }],
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              type: 'taskItem',
              attrs: { checked: true },
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Task 4' }],
                },
              ],
            },
          ],
        },
      ],
    }

    it('should convert nested markdown to expected JSON structure', () => {
      const json = markdownManager.parse(expectedMarkdown)
      expect(json).to.deep.equal(expectedJSON)
    })

    it('should convert nested JSON structure back to expected markdown', () => {
      const md = markdownManager.serialize(expectedJSON)
      expect(md.trim()).to.equal(expectedMarkdown.trim())
    })
  })

  describe('convert bulletList from and to markdown', () => {
    const bulletListMarkdown = `
- Item 1
- Item 2
  - Subitem 1
  - Subitem 2
- Item 3
`.trim()

    const bulletListJSON = {
      type: 'doc',
      content: [
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Item 1' }],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Item 2' }],
                },
                {
                  type: 'bulletList',
                  content: [
                    {
                      type: 'listItem',
                      content: [
                        {
                          type: 'paragraph',
                          content: [{ type: 'text', text: 'Subitem 1' }],
                        },
                      ],
                    },
                    {
                      type: 'listItem',
                      content: [
                        {
                          type: 'paragraph',
                          content: [{ type: 'text', text: 'Subitem 2' }],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Item 3' }],
                },
              ],
            },
          ],
        },
      ],
    }

    it('should convert bulletList markdown to expected JSON structure', () => {
      const json = markdownManager.parse(bulletListMarkdown)
      expect(json).to.deep.equal(bulletListJSON)
    })

    it('should convert bulletList JSON structure back to expected markdown', () => {
      const md = markdownManager.serialize(bulletListJSON)
      expect(md.trim()).to.equal(bulletListMarkdown.trim())
    })
  })
})
