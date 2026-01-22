import { createBlockMarkdownSpec, Node } from '@dibdab/core'

export const name = 'Nested Nodes'

export const expectedInput = `
:::custom-block

This is a node with **bold text**.

:::custom-block

And this is a nested block.

:::

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
        {
          type: 'customBlock',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'And this is a nested block.' }],
            },
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
