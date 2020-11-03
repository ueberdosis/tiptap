import { Command, createExtension } from '@tiptap/core'

type TextAlignOptions = {
  types: string[],
  alignments: string[],
  defaultAlignment: string,
}

const TextAlign = createExtension({
  defaultOptions: <TextAlignOptions>{
    types: ['heading', 'paragraph'],
    alignments: ['left', 'center', 'right', 'justify'],
    defaultAlignment: 'left',
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          textAlign: {
            default: this.options.defaultAlignment,
            renderHTML: attributes => ({
              style: `text-align: ${attributes.textAlign}`,
            }),
            parseHTML: element => ({
              textAlign: element.style.textAlign || this.options.defaultAlignment,
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

  addKeyboardShortcuts() {
    return {
      // TODO: re-use only 'textAlign' attribute
      // TODO: use custom splitBlock only for `this.options.types`
      // TODO: use complete default enter handler (chainCommand) with custom splitBlock
      Enter: () => this.editor.splitBlock(true),
    }
  },
})

export default TextAlign

declare module '@tiptap/core/src/Editor' {
  interface AllExtensions {
    TextAlign: typeof TextAlign,
  }
}
