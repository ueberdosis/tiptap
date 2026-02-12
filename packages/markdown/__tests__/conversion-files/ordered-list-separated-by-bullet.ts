export const name = 'Ordered List Separated by Bullet List'

export const expectedInput = `
1. one

- inner

2. two
`.trim()

export const expectedOutput = {
  type: 'doc',
  content: [
    {
      type: 'orderedList',
      content: [
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'one' }],
            },
          ],
        },
      ],
    },
    {
      type: 'bulletList',
      content: [
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'inner' }],
            },
          ],
        },
      ],
    },
    {
      type: 'orderedList',
      attrs: {
        start: 2,
      },
      content: [
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'two' }],
            },
          ],
        },
      ],
    },
  ],
}
