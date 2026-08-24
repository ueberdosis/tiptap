export const name = 'Link with Title'

export const expectedInput = `
[click here](https://example.com "Example Site")
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
                title: 'Example Site',
              },
            },
          ],
        },
      ],
    },
  ],
}
