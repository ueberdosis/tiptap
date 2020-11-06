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

declare module '@tiptap/core/src/Editor' {
  interface AllExtensions {
    FontFamily: typeof FontFamily,
  }
}
