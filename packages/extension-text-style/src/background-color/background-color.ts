import '../text-style/index.js'

import { Extension } from '@tiptap/core'

import { normalizeColor } from '../utilities/normalize-color.js'
import { normalizeDocColorAttrs } from '../utilities/normalize-color-attrs.js'

export type BackgroundColorOptions = {
  /**
   * The types where the color can be applied
   * @default ['textStyle']
   * @example ['heading', 'paragraph']
   */
  types: string[]
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    backgroundColor: {
      /**
       * Set the text color
       * @param backgroundColor The color to set
       * @example editor.commands.setColor('red')
       */
      setBackgroundColor: (backgroundColor: string) => ReturnType

      /**
       * Unset the text backgroundColor
       * @example editor.commands.unsetBackgroundColor()
       */
      unsetBackgroundColor: () => ReturnType
    }
  }
}

// @ts-ignore because the module is not found during dts build
declare module '@tiptap/extension-text-style' {
  interface TextStyleAttributes {
    backgroundColor?: string | null
  }
}

/**
 * This extension allows you to color your text.
 * @see https://tiptap.dev/api/extensions/background-color
 */
export const BackgroundColor = Extension.create<BackgroundColorOptions>({
  name: 'backgroundColor',

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
          backgroundColor: {
            default: null,
            parseHTML: element => {
              const color = element.style.backgroundColor

              if (!color) {
                return null
              }

              return normalizeColor(color.replace(/['"]+/g, ''))
            },
            renderHTML: attributes => {
              if (!attributes.backgroundColor) {
                return {}
              }

              return {
                style: `background-color: ${normalizeColor(attributes.backgroundColor)}`,
              }
            },
          },
        },
      },
    ]
  },

  onCreate() {
    normalizeDocColorAttrs(this.editor, 'backgroundColor')
  },

  addCommands() {
    return {
      setBackgroundColor:
        backgroundColor =>
        ({ chain }) => {
          return chain()
            .setMark('textStyle', { backgroundColor: normalizeColor(backgroundColor) })
            .run()
        },
      unsetBackgroundColor:
        () =>
        ({ chain }) => {
          return chain().setMark('textStyle', { backgroundColor: null }).removeEmptyTextStyle().run()
        },
    }
  },
})
