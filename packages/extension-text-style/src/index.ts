import { Command, createMark, getMarkAttrs } from '@tiptap/core'

const TextStyle = createMark({
  name: 'textStyle',

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
    return ['span', HTMLAttributes, 0]
  },

  addCommands() {
    return {
      removeEmptyTextStyle: (): Command => ({ state, commands }) => {
        const attributes = getMarkAttrs(state, this.type)
        const hasStyles = Object.entries(attributes).every(([, value]) => !!value)

        if (hasStyles) {
          return true
        }

        return commands.removeMark('textStyle')
      },
    }
  },

})

export default TextStyle

declare module '@tiptap/core' {
  interface AllExtensions {
    TextStyle: typeof TextStyle,
  }
}
