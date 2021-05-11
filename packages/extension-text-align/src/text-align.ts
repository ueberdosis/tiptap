import { Command, Extension } from '@tiptap/core'

type TextAlignOptions = {
  types: string[],
  alignments: string[],
  defaultAlignment: string,
}

declare module '@tiptap/core' {
  interface Commands {
    textAlign: {
      /**
       * Set the text align attribute
       */
      setTextAlign: (alignment: string) => Command,
      /**
       * Unset the text align attribute
       */
      unsetTextAlign: () => Command,
    }
  }
}

export const TextAlign = Extension.create<TextAlignOptions>({
  name: 'textAlign',

  defaultOptions: {
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
            renderHTML: attributes => {
              if (attributes.textAlign === this.options.defaultAlignment) {
                return {}
              }

              return { style: `text-align: ${attributes.textAlign}` }
            },
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
      setTextAlign: (alignment: string) => ({ commands }) => {
        if (!this.options.alignments.includes(alignment)) {
          return false
        }

        return this.options.types.every(type => commands.updateAttributes(type, { textAlign: alignment }))
      },
      unsetTextAlign: () => ({ commands }) => {
        return this.options.types.every(type => commands.resetAttributes(type, 'textAlign'))
      },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-l': () => this.editor.commands.setTextAlign('left'),
      'Mod-Shift-e': () => this.editor.commands.setTextAlign('center'),
      'Mod-Shift-r': () => this.editor.commands.setTextAlign('right'),
      'Mod-Shift-j': () => this.editor.commands.setTextAlign('justify'),
    }
  },
})
