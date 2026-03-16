export const name = 'Link without Title'

export const expectedInput = `
[click here](https://example.com)
`.trim()

export const expectedOutput = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'click here',
          marks: [
            {
              type: 'link',
              attrs: {
                href: 'https://example.com',
                title: null,
              },
            },
          ],
        },
      ],
    },
  ],
}
