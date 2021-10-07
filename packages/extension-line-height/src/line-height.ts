import { Extension } from '@tiptap/core'
import '@tiptap/extension-text-style'

type LineHeightOptions = {
  types: string[],
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    lineHeight: {
      /**
       * Set the text line height
       */
      setLineHeight: (value: string) => ReturnType,
      /**
       * Unset the text line height
       */
      unsetLineHeight: () => ReturnType,
    }
  }
}

export const LineHeight = Extension.create<LineHeightOptions>({
  name: 'lineHeight',

  defaultOptions: {
    types: ['textStyle'],
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          lineHeight: {
            default: null,
            parseHTML: element => element.style.lineHeight,
            renderHTML: attributes => {
              if (!attributes.lineHeight) {
                return {}
              }

              return {
                style: `line-height: ${attributes.lineHeight}`,
              }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setLineHeight: value => ({ chain }) => {
        return chain()
          .setMark('textStyle', { lineHeight: value })
          .run()
      },
      unsetLineHeight: () => ({ chain }) => {
        return chain()
          .setMark('textStyle', { lineHeight: null })
          .removeEmptyTextStyle()
          .run()
      },
    }
  },
})
