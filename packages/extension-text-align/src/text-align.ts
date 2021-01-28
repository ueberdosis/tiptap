import { Command, Extension } from '@tiptap/core'

type TextAlignOptions = {
  types: string[],
  alignments: string[],
  defaultAlignment: string,
}

export const TextAlign = Extension.create({
  name: 'textAlign',

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
      /**
       * Set the text align attribute
       */
      setTextAlign: (alignment: string): Command => ({ commands }) => {
        if (!this.options.alignments.includes(alignment)) {
          return false
        }

        return this.options.types.every(type => commands.updateNodeAttributes(type, { textAlign: alignment }))
      },
      /**
       * Unset the text align attribute
       */
      unsetTextAlign: (): Command => ({ commands }) => {
        return this.options.types.every(type => commands.resetNodeAttributes(type, 'textAlign'))
      },
    }
  },

  addKeyboardShortcuts() {
    return {
      // TODO: re-use only 'textAlign' attribute
      // TODO: use custom splitBlock only for `this.options.types`
      // Enter: () => this.editor.commands.first(({ commands }) => [
      //   () => commands.newlineInCode(),
      //   () => commands.createParagraphNear(),
      //   () => commands.liftEmptyBlock(),
      //   () => commands.splitBlock({
      //     withAttributes: true,
      //   }),
      // ]),
      'Mod-Shift-l': () => this.editor.commands.setTextAlign('left'),
      'Mod-Shift-e': () => this.editor.commands.setTextAlign('center'),
      'Mod-Shift-r': () => this.editor.commands.setTextAlign('right'),
      'Mod-Shift-j': () => this.editor.commands.setTextAlign('justify'),
    }
  },
})

declare module '@tiptap/core' {
  interface AllExtensions {
    TextAlign: typeof TextAlign,
  }
}
