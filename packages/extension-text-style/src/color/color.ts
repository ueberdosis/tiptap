import '../text-style/index.js'

import { Extension, getStyleProperty } from '@tiptap/core'

import { createColorNormalizationPlugin } from '../utilities/normalize-color-plugin.js'

export type ColorOptions = {
  /**
   * The types where the color can be applied
   * @default ['textStyle']
   * @example ['heading', 'paragraph']
   */
  types: string[]

  /**
   * An optional callback used to normalize color values to a canonical form
   * (e.g. hex to `rgb(...)`), so parsed and rendered colors stay consistent.
   * This can prevent the cursor from jumping during IME composition when a
   * color is re-parsed into a different string representation.
   *
   * Pass the built-in `normalizeColor` helper to normalize using the
   * browser's own CSS parser, or provide a custom function.
   * @default null
   * @example colorNormalizer: normalizeColor
   */
  colorNormalizer: ((color: string) => string) | null
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
      colorNormalizer: null,
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
              // Prefer the raw inline `style` attribute so we preserve the
              // original format (e.g. `#rrggbb`) instead of the canonicalized
              // `rgb(...)` value returned by `element.style.color`.
              const color = getStyleProperty(element, 'color') ?? element.style.color

              if (!color) {
                return null
              }

              const value = color.replace(/['"]+/g, '')

              return this.options.colorNormalizer ? this.options.colorNormalizer(value) : value
            },
            renderHTML: attributes => {
              if (!attributes.color) {
                return {}
              }

              const value = this.options.colorNormalizer
                ? this.options.colorNormalizer(attributes.color)
                : attributes.color

              return {
                style: `color: ${value}`,
              }
            },
          },
        },
      },
    ]
  },

  addProseMirrorPlugins() {
    if (!this.options.colorNormalizer) {
      return []
    }

    return [createColorNormalizationPlugin('color', this.options.colorNormalizer)]
  },

  addCommands() {
    return {
      setColor:
        color =>
        ({ chain }) => {
          const value = this.options.colorNormalizer ? this.options.colorNormalizer(color) : color

          return chain().setMark('textStyle', { color: value }).run()
        },
      unsetColor:
        () =>
        ({ chain }) => {
          return chain().setMark('textStyle', { color: null }).removeEmptyTextStyle().run()
        },
    }
  },
})
