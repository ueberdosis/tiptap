import '../text-style/index.js'

import { Extension } from '@dibdab/core'

export type FontSizeOptions = {
  /**
   * A list of node names where the font size can be applied.
   * @default ['textStyle']
   * @example ['heading', 'paragraph']
   */
  types: string[]
}

declare module '@dibdab/core' {
  interface Commands<ReturnType> {
    fontSize: {
      /**
       * Set the font size
       * @param fontSize The font size
       * @example editor.commands.setFontSize('16px')
       */
      setFontSize: (fontSize: string) => ReturnType
      /**
       * Unset the font size
       * @example editor.commands.unsetFontSize()
       */
      unsetFontSize: () => ReturnType
    }
  }
}

// @ts-ignore because the module is not found during dts build
declare module '@dibdab/extension-text-style' {
  interface TextStyleAttributes {
    fontSize?: string | null
  }
}

/**
 * This extension allows you to set a font size for text.
 * @see https://www.tiptap.dev/api/extensions/font-size
 */
export const FontSize = Extension.create<FontSizeOptions>({
  name: 'fontSize',

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
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize,
            renderHTML: attributes => {
              if (!attributes.fontSize) {
                return {}
              }

              return {
                style: `font-size: ${attributes.fontSize}`,
              }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setFontSize:
        fontSize =>
        ({ chain }) => {
          return chain().setMark('textStyle', { fontSize }).run()
        },
      unsetFontSize:
        () =>
        ({ chain }) => {
          return chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run()
        },
    }
  },
})
