import { Extension } from '@tiptap/core'
import '@tiptap/extension-text-style'

type ColorOptions = {
  types: string[],
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    color: {
      /**
       * Set the text color
       */
      setColor: (color: string) => ReturnType,
      /**
       * Unset the text color
       */
      unsetColor: () => ReturnType,
    }
  }
}

export const Color = Extension.create<ColorOptions>({
  name: 'color',

  defaultOptions: {
    types: ['textStyle'],
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          color: {
            default: null,
            parseHTML: element => element.style.color.replace(/['"]+/g, ''),
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
      setColor: color => ({ chain }) => {
        return chain()
          .setMark('textStyle', { color })
          .run()
      },
      unsetColor: () => ({ chain }) => {
        return chain()
          .setMark('textStyle', { color: null })
          .removeEmptyTextStyle()
          .run()
      },
    }
  },
})
