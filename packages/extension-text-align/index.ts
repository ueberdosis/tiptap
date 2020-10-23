import { createExtension } from '@tiptap/core'

const TextAlign = createExtension({
  addGlobalAttributes() {
    return [
      {
        types: ['paragraph'],
        attributes: {
          align: {
            default: 'left',
            renderHTML: attributes => ({
              style: `text-align: ${attributes.align}`,
            }),
          },
        },
      },
    ]
  },
})

export default TextAlign

declare module '@tiptap/core/src/Editor' {
  interface AllExtensions {
    TextAlign: typeof TextAlign,
  }
}
