import { createInlineMarkdownSpec, Node } from '@dibdab/core'

export const name = 'Custom Inline'

export const expectedInput = `
This is a [custom-inline type="bug" id="1234"] ticket.

This is a [custom-inline-tag icon="house"]Home[/custom-inline-tag] tag.
`.trim()

export const expectedOutput = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'This is a ' },
        {
          type: 'customInline',
          attrs: { type: 'bug', id: '1234' },
        },
        { type: 'text', text: ' ticket.' },
      ],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'This is a ' },
        {
          type: 'customInlineTag',
          attrs: { icon: 'house' },
          content: [{ type: 'text', text: 'Home' }],
        },
        { type: 'text', text: ' tag.' },
      ],
    },
  ],
}

export const extensions = [
  Node.create({
    name: 'customInline',

    group: 'inline',

    atom: true,

    markdownTokenName: 'custom-inline',

    ...createInlineMarkdownSpec({
      nodeName: 'customInline',
      name: 'custom-inline',
      selfClosing: true,
      allowedAttributes: ['type', 'id'],
    }),

    parseHTML() {
      return [
        {
          tag: 'span[data-type="custom-inline"]',
        },
      ]
    },

    renderHTML({ HTMLAttributes }) {
      return ['span', { 'data-type': 'custom-inline', ...HTMLAttributes }]
    },
  }),
  Node.create({
    name: 'customInlineTag',

    group: 'inline',

    content: 'inline*',

    markdownTokenName: 'custom-inline-tag',

    ...createInlineMarkdownSpec({
      nodeName: 'customInlineTag',
      name: 'custom-inline-tag',
      allowedAttributes: ['icon'],
    }),

    parseHTML() {
      return [
        {
          tag: 'span[data-type="custom-inline-tag"]',
        },
      ]
    },

    renderHTML({ HTMLAttributes }) {
      return ['span', { 'data-type': 'custom-inline-tag', ...HTMLAttributes }, 0]
    },
  }),
]
