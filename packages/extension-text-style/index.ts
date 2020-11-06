import { createMark } from '@tiptap/core'

const TextStyle = createMark({
  name: 'textStyle',

  parseHTML() {
    return [
      {
        tag: 'span',
      },
    ]
  },

  renderHTML({ attributes }) {
    return ['span', attributes, 0]
  },
})

export default TextStyle

declare module '@tiptap/core/src/Editor' {
  interface AllExtensions {
    TextStyle: typeof TextStyle,
  }
}
