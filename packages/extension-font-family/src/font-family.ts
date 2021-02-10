import { Command, Extension } from '@tiptap/core'
import '@tiptap/extension-text-style'

type FontFamilyOptions = {
  types: string[],
}

declare module '@tiptap/core' {
  interface Commands {
    setFontFamily: (fontFamily: string) => Command,
    unsetFontFamily: () => Command,
  }
}

export const FontFamily = Extension.create({
  name: 'fontFamily',

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
            renderHTML: attributes => {
              if (!attributes.fontFamily) {
                return {}
              }

              return {
                style: `font-family: ${attributes.fontFamily}`,
              }
            },
            parseHTML: element => ({
              fontFamily: element.style.fontFamily.replace(/['"]+/g, ''),
            }),
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      /**
       * Set the font family
       */
      setFontFamily: fontFamily => ({ chain }) => {
        return chain()
          .setMark('textStyle', { fontFamily })
          .run()
      },
      /**
       * Unset the font family
       */
      unsetFontFamily: () => ({ chain }) => {
        return chain()
          .setMark('textStyle', { fontFamily: null })
          .removeEmptyTextStyle()
          .run()
      },
    }
  },
})
