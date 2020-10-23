import { createExtension } from '@tiptap/core'

type TextAlignOptions = {
  types: string[],
}

const TextAlign = createExtension({
  defaultOptions: <TextAlignOptions>{
    types: ['heading', 'paragraph'],
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          textAlign: {
            default: 'left',
            renderHTML: attributes => ({
              style: `text-align: ${attributes.textAlign}`,
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
