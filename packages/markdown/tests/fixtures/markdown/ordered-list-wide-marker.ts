export const name = 'Ordered List with a Wide Marker'

// `10. ` is four characters, so the nested list has to start at column four to
// stay a child of it.
export const expectedInput = `
10. ten
    1. inner
11. eleven
`.trim()

export const expectedOutput = {
  type: 'doc',
  content: [
    {
      type: 'orderedList',
      attrs: { start: 10 },
      content: [
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'ten' }],
            },
            {
              type: 'orderedList',
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
          ],
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'eleven' }],
            },
          ],
        },
      ],
    },
  ],
}
