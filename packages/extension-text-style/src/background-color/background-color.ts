import '../text-style/index.js'

import { Extension, getStyleProperty } from '@tiptap/core'

import { createColorNormalizationPlugin } from '../utilities/normalize-color-plugin.js'

export type BackgroundColorOptions = {
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
      colorNormalizer: null,
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
              // Prefer the raw inline `style` attribute so we preserve the
              // original format (e.g. `#rrggbb`) instead of the canonicalized
              // `rgb(...)` value returned by `element.style.backgroundColor`.
              const color =
                getStyleProperty(element, 'background-color') ?? element.style.backgroundColor

              if (!color) {
                return null
              }

              const value = color.replace(/['"]+/g, '')

              return this.options.colorNormalizer ? this.options.colorNormalizer(value) : value
            },
            renderHTML: attributes => {
              if (!attributes.backgroundColor) {
                return {}
              }

              const value = this.options.colorNormalizer
                ? this.options.colorNormalizer(attributes.backgroundColor)
                : attributes.backgroundColor

              return {
                style: `background-color: ${value}`,
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

    return [createColorNormalizationPlugin('backgroundColor', this.options.colorNormalizer)]
  },

  addCommands() {
    return {
      setBackgroundColor:
        backgroundColor =>
        ({ chain }) => {
          const value = this.options.colorNormalizer
            ? this.options.colorNormalizer(backgroundColor)
            : backgroundColor

          return chain().setMark('textStyle', { backgroundColor: value }).run()
        },
      unsetBackgroundColor:
        () =>
        ({ chain }) => {
          return chain()
            .setMark('textStyle', { backgroundColor: null })
            .removeEmptyTextStyle()
            .run()
        },
    }
  },
})
