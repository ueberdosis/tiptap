export const name = 'Task List'

export const expectedInput = `
- [ ] Task 1
- [x] Task 2
- [ ] Task 3
  - [ ] Subtask 1
  - [x] Subtask 2
    - [ ] Subtask 2a
    - [x] Subtask 2b
- [x] Task 4
`.trim()

export const expectedOutput = {
  type: 'doc',
  content: [
    {
      type: 'taskList',
      content: [
        {
          type: 'taskItem',
          attrs: { checked: false },
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Task 1' }],
            },
          ],
        },
        {
          type: 'taskItem',
          attrs: { checked: true },
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Task 2' }],
            },
          ],
        },
        {
          type: 'taskItem',
          attrs: { checked: false },
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Task 3' }],
            },
            {
              type: 'taskList',
              content: [
                {
                  type: 'taskItem',
                  attrs: { checked: false },
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: 'Subtask 1' }],
                    },
                  ],
                },
                {
                  type: 'taskItem',
                  attrs: { checked: true },
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: 'Subtask 2' }],
                    },
                    {
                      type: 'taskList',
                      content: [
                        {
                          type: 'taskItem',
                          attrs: { checked: false },
                          content: [
                            {
                              type: 'paragraph',
                              content: [{ type: 'text', text: 'Subtask 2a' }],
                            },
                          ],
                        },
                        {
                          type: 'taskItem',
                          attrs: { checked: true },
                          content: [
                            {
                              type: 'paragraph',
                              content: [{ type: 'text', text: 'Subtask 2b' }],
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
          type: 'taskItem',
          attrs: { checked: true },
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Task 4' }],
            },
          ],
        },
      ],
    },
  ],
}
