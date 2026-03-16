import '../text-style/index.js'

import { Extension } from '@tiptap/core'

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
              // Prefer the raw inline `style` attribute so we preserve
              // the original format (e.g. `#rrggbb`) instead of the
              // computed `rgb(...)` value returned by `element.style.backgroundColor`.
              // When nested spans are merged the style attribute may contain
              // multiple `background-color:` declarations (parent;child). We should pick
              // the last declaration so the child's background color takes priority.
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
                    if (prop === 'background-color') {
                      return val.replace(/['"]+/g, '')
                    }
                  }
                }
              }

              return element.style.backgroundColor?.replace(/['"]+/g, '')
            },
            renderHTML: attributes => {
              if (!attributes.backgroundColor) {
                return {}
              }

              return {
                style: `background-color: ${attributes.backgroundColor}`,
              }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setBackgroundColor:
        backgroundColor =>
        ({ chain }) => {
          return chain().setMark('textStyle', { backgroundColor }).run()
        },
      unsetBackgroundColor:
        () =>
        ({ chain }) => {
          return chain().setMark('textStyle', { backgroundColor: null }).removeEmptyTextStyle().run()
        },
    }
  },
})
