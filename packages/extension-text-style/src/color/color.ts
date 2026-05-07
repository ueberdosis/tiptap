import '../text-style/index.js'

import { Extension } from '@tiptap/core'

import { normalizeColor } from '../utilities/normalize-color.js'
import { createColorNormalizationPlugin } from '../utilities/normalize-color-plugin.js'

export type ColorOptions = {
  /**
   * The types where the color can be applied
   * @default ['textStyle']
   * @example ['heading', 'paragraph']
   */
  types: string[]
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    color: {
      /**
       * Set the text color
       * @param color The color to set
       * @example editor.commands.setColor('red')
       */
      setColor: (color: string) => ReturnType

      /**
       * Unset the text color
       * @example editor.commands.unsetColor()
       */
      unsetColor: () => ReturnType
    }
  }
}

// @ts-ignore because the module is not found during dts build
declare module '@tiptap/extension-text-style' {
  interface TextStyleAttributes {
    color?: string | null
  }
}

/**
 * This extension allows you to color your text.
 * @see https://tiptap.dev/api/extensions/color
 */
export const Color = Extension.create<ColorOptions>({
  name: 'color',

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
          color: {
            default: null,
            parseHTML: element => {
              const color = element.style.color

              if (!color) {
                return null
              }

              return normalizeColor(color.replace(/['"]+/g, ''))
            },
            renderHTML: attributes => {
              if (!attributes.color) {
                return {}
              }

              return {
                style: `color: ${normalizeColor(attributes.color)}`,
              }
            },
          },
        },
      },
    ]
  },

  addProseMirrorPlugins() {
    return [createColorNormalizationPlugin('color')]
  },

  addCommands() {
    return {
      setColor:
        color =>
        ({ chain }) => {
          return chain()
            .setMark('textStyle', { color: normalizeColor(color) })
            .run()
        },
      unsetColor:
        () =>
        ({ chain }) => {
          return chain().setMark('textStyle', { color: null }).removeEmptyTextStyle().run()
        },
    }
  },
})
