import { createBlockMarkdownSpec, Node } from '@tiptap/core'

export const name = 'Custom Block'

export const expectedInput = `
:::custom-block

This is a node with **bold text**.

:::`.trim()

export const expectedOutput = {
  type: 'doc',
  content: [
    {
      type: 'customBlock',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'This is a node with ' },
            { type: 'text', marks: [{ type: 'bold' }], text: 'bold text' },
            { type: 'text', text: '.' },
          ],
        },
      ],
    },
  ],
}

export const extensions = [
  Node.create({
    name: 'customBlock',

    group: 'block',

    content: 'block+',

    ...createBlockMarkdownSpec({
      nodeName: 'customBlock',
      name: 'custom-block',
      content: 'block',
    }),

    parseHTML() {
      return [
        {
          tag: 'div[data-type="custom-block"]',
        },
      ]
    },

    renderHTML({ HTMLAttributes }) {
      return ['div', { 'data-type': 'custom-block', ...HTMLAttributes }, 0]
    },
  }),
]
