import '@tiptap/extension-text-style'

import { Extension } from '@tiptap/core'

export type FontFamilyOptions = {
  /**
   * A list of node names where the font family can be applied.
   * @default ['textStyle']
   * @example ['heading', 'paragraph']
   */
  types: string[],
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fontFamily: {
      /**
       * Set the font family
       * @param fontFamily The font family
       * @example editor.commands.setFontFamily('Arial')
       */
      setFontFamily: (fontFamily: string) => ReturnType,
      /**
       * Unset the font family
       * @example editor.commands.unsetFontFamily()
       */
      unsetFontFamily: () => ReturnType,
    }
  }
}

/**
 * This extension allows you to set a font family for text.
 * @see https://www.tiptap.dev/api/extensions/font-family
 */
export const FontFamily = Extension.create<FontFamilyOptions>({
  name: 'fontFamily',

  addOptions() {
    return {
      types: ['textStyle'],
    }
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontFamily: {
            default: null,
            parseHTML: element => element.style.fontFamily,
            renderHTML: attributes => {
              if (!attributes.fontFamily) {
                return {}
              }

              return {
                style: `font-family: ${attributes.fontFamily}`,
              }
            },
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
