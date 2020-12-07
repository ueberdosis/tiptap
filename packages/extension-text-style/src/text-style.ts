import {
  Command,
  Mark,
  getMarkAttributes,
  mergeAttributes,
} from '@tiptap/core'

export interface TextStyleOptions {
  HTMLAttributes: {
    [key: string]: any
  },
}

export const TextStyle = Mark.create({
  name: 'textStyle',

  defaultOptions: <TextStyleOptions>{
    HTMLAttributes: {},
  },

  parseHTML() {
    return [
      {
        tag: 'span',
        getAttrs: element => {
          const hasStyles = (element as HTMLElement).hasAttribute('style')

          if (!hasStyles) {
            return false
          }

          return {}
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

  addCommands() {
    return {
      /**
       * Remove spans without inline style attributes.
       */
      removeEmptyTextStyle: (): Command => ({ state, commands }) => {
        const attributes = getMarkAttributes(state, this.type)
        const hasStyles = Object.entries(attributes).every(([, value]) => !!value)

        if (hasStyles) {
          return true
        }

        return commands.unsetMark('textStyle')
      },
    }
  },

})

declare module '@tiptap/core' {
  interface AllExtensions {
    TextStyle: typeof TextStyle,
  }
}
