import { Command, Extension } from '@tiptap/core'
import '@tiptap/extension-text-style'

type FontFamilyOptions = {
  types: string[],
}

declare module '@tiptap/core' {
  interface Commands {
    fontFamily: {
      /**
       * Set the font family
       */
      setFontFamily: (fontFamily: string) => Command,
      /**
       * Unset the font family
       */
      unsetFontFamily: () => Command,
    }
  }
}

export const FontFamily = Extension.create<FontFamilyOptions>({
  name: 'fontFamily',

  defaultOptions: {
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
      setFontFamily: fontFamily => ({ chain }) => {
        return chain()
          .setMark('textStyle', { fontFamily })
          .run()
      },
      unsetFontFamily: () => ({ chain }) => {
        return chain()
          .setMark('textStyle', { fontFamily: null })
          .removeEmptyTextStyle()
          .run()
      },
    }
  },
})
