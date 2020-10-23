import { Command, createExtension } from '@tiptap/core'

type TextAlignOptions = {
  types: string[],
  alignments: string[],
}

const TextAlign = createExtension({
  defaultOptions: <TextAlignOptions>{
    types: ['heading', 'paragraph'],
    alignments: ['left', 'center', 'right'],
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
            parseHTML: node => ({
              textAlign: node.style.textAlign,
            }),
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      textAlign: (alignment: string): Command => ({ commands }) => {
        if (!this.options.alignments.includes(alignment)) {
          return false
        }

        return commands.setNodeAttributes({ textAlign: alignment })
      },
    }
  },
})

export default TextAlign

declare module '@tiptap/core/src/Editor' {
  interface AllExtensions {
    TextAlign: typeof TextAlign,
  }
}
