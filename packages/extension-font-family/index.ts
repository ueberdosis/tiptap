import { Command, createExtension } from '@tiptap/core'

type FontFamilyOptions = {
  types: string[],
}

const FontFamily = createExtension({
  defaultOptions: <FontFamilyOptions>{
    types: ['textStyle'],
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontFamily: {
            default: null,
            renderHTML: attributes => ({
              style: `font-family: ${attributes.fontFamily}`,
            }),
            parseHTML: element => ({
              fontFamily: element.style.fontFamily,
            }),
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      fontFamily: (fontFamily: string): Command => ({ commands }) => {
        return commands.updateMarkAttributes('textStyle', { fontFamily })
      },
    }
  },
})

export default FontFamily

declare module '@tiptap/core/src/Editor' {
  interface AllExtensions {
    FontFamily: typeof FontFamily,
  }
}
