import { createAtomBlockMarkdownSpec, Node } from '@tiptap/core'

export const name = 'Custom Atom'

export const expectedInput = `
:::custom-atom {label="Example"}
`.trim()

export const expectedOutput = {
  type: 'doc',
  content: [
    {
      type: 'customAtom',
      attrs: { label: 'Example' },
      content: [],
    },
  ],
}

export const extensions = [
  Node.create({
    name: 'customAtom',

    group: 'block',

    atom: true,

    markdown: createAtomBlockMarkdownSpec({
      nodeName: 'customAtom',
      name: 'custom-atom',
      allowedAttributes: ['label'],
    }),

    parseHTML() {
      return [
        {
          tag: 'div[data-type="custom-atom"]',
        },
      ]
    },

    renderHTML({ HTMLAttributes }) {
      return ['div', { 'data-type': 'custom-atom', ...HTMLAttributes }]
    },
  }),
]
