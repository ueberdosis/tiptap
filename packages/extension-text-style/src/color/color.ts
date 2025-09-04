import '../text-style/index.js'

import { Extension } from '@tiptap/core'

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
              // Prefer the raw inline `style` attribute so we preserve
              // the original format (e.g. `#rrggbb`) instead of the
              // computed `rgb(...)` value returned by `element.style.color`.
              // When nested spans are merged the style attribute may contain
              // multiple `color:` declarations (parent;child). We should pick
              // the last declaration so the child's color takes priority.
              const styleAttr = element.getAttribute('style')
              if (styleAttr) {
                const decls = styleAttr
                  .split(';')
                  .map(s => s.trim())
                  .filter(Boolean)
                for (let i = decls.length - 1; i >= 0; i -= 1) {
                  const parts = decls[i].split(':')
                  if (parts.length >= 2) {
                    const prop = parts[0].trim().toLowerCase()
                    const val = parts.slice(1).join(':').trim()
                    if (prop === 'color') {
                      return val.replace(/['"]+/g, '')
                    }
                  }
                }
              }

              return element.style.color?.replace(/['"]+/g, '')
            },
            renderHTML: attributes => {
              if (!attributes.color) {
                return {}
              }

              return {
                style: `color: ${attributes.color}`,
              }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setColor:
        color =>
        ({ chain }) => {
          return chain().setMark('textStyle', { color }).run()
        },
      unsetColor:
        () =>
        ({ chain }) => {
          return chain().setMark('textStyle', { color: null }).removeEmptyTextStyle().run()
        },
    }
  },
})
