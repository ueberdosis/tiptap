import type { JSONContent } from '@tiptap/core'

export const content: JSONContent = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Select some text and add an annotation. Split this paragraph before the highlighted text.',
        },
      ],
    },
    {
      type: 'image',
      attrs: {
        src: '/annotation-landscape.svg',
        alt: 'Purple mountains with a yellow sun',
        title: 'Select this image to annotate it',
      },
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Click the image, annotate it, then move it to the end. Its annotation should follow on both clients.',
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
              content: [
                {
                  type: 'text',
                  text: 'Annotate text inside this list item and split it with Enter.',
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
              content: [
                {
                  type: 'text',
                  text: 'Try moving, copying, undoing, and deleting annotated content.',
                },
              ],
            },
          ],
        },
      ],
    },
    { type: 'paragraph' },
  ],
}
