import { Command, Extension } from '@tiptap/core'
import '@tiptap/extension-text-style'

type FontFamilyOptions = {
  types: string[],
}

const FontFamily = Extension.create({
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
       * Update the font family
       */
      fontFamily: (fontFamily: string | null = null): Command => ({ chain }) => {
        return chain()
          .updateMarkAttributes('textStyle', { fontFamily })
          .removeEmptyTextStyle()
          .run()
      },
    }
  },
})

export default FontFamily

declare global {
  namespace Tiptap {
    interface AllExtensions {
      FontFamily: typeof FontFamily,
    }
  }
}
