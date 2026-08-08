export const name = 'Soft Break with Marks'

export const expectedInput = `**Speaker:** John Doe.

**Speaker:** **John Doe**`.trim()

export const expectedOutput = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        { type: 'text', marks: [{ type: 'bold' }], text: 'Speaker:' },
        { type: 'text', text: ' John Doe.' },
      ],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', marks: [{ type: 'bold' }], text: 'Speaker:' },
        { type: 'text', text: ' ' },
        { type: 'text', marks: [{ type: 'bold' }], text: 'John Doe' },
      ],
    },
  ],
}

export const extensions = []
