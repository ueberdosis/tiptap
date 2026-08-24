export const name = 'Ordered List'

export const expectedInput = `
1. Item 1
2. Item 2
  1. Subitem 1
  2. Subitem 2
    1. Subsubitem 1
    2. Subsubitem 2
3. Item 3
  1. Subitem 1
  2. Subitem 2
    1. Subsubitem 1
    2. Subsubitem 2
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
              content: [{ type: 'text', text: 'Item 1' }],
            },
          ],
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Item 2' }],
            },
            {
              type: 'orderedList',
              content: [
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: 'Subitem 1' }],
                    },
                  ],
                },
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: 'Subitem 2' }],
                    },
                    {
                      type: 'orderedList',
                      content: [
                        {
                          type: 'listItem',
                          content: [
                            {
                              type: 'paragraph',
                              content: [{ type: 'text', text: 'Subsubitem 1' }],
                            },
                          ],
                        },
                        {
                          type: 'listItem',
                          content: [
                            {
                              type: 'paragraph',
                              content: [{ type: 'text', text: 'Subsubitem 2' }],
                            },
                          ],
                        },
                      ],
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
              content: [{ type: 'text', text: 'Item 3' }],
            },
            {
              type: 'orderedList',
              content: [
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: 'Subitem 1' }],
                    },
                  ],
                },
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: 'Subitem 2' }],
                    },
                    {
                      type: 'orderedList',
                      content: [
                        {
                          type: 'listItem',
                          content: [
                            {
                              type: 'paragraph',
                              content: [{ type: 'text', text: 'Subsubitem 1' }],
                            },
                          ],
                        },
                        {
                          type: 'listItem',
                          content: [
                            {
                              type: 'paragraph',
                              content: [{ type: 'text', text: 'Subsubitem 2' }],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
