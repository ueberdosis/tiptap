export const name = 'Overlapping Marks'

export const expectedInput = `**This sentence has *overlapping formatting*** *applied to it*.`

export const expectedOutput = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          marks: [
            {
              type: 'bold',
            },
          ],
          text: 'This sentence has ',
        },
        {
          type: 'text',
          marks: [
            {
              type: 'italic',
            },
            {
              type: 'bold',
            },
          ],
          text: 'overlapping formatting',
        },
        {
          type: 'text',
          text: ' ',
        },
        {
          type: 'text',
          marks: [
            {
              type: 'italic',
            },
          ],
          text: 'applied to it',
        },
        {
          type: 'text',
          text: '.',
        },
      ],
    },
  ],
}

export const extensions = []
