import { Command, createMark } from '@tiptap/core'

const Underline = createMark({
  name: 'underline',

  parseHTML() {
    return [
      {
        tag: 'u',
      },
      {
        style: 'text-decoration=underline',
      },
    ]
  },

  renderHTML({ attributes }) {
    return ['u', attributes, 0]
  },

  addCommands() {
    return {
      underline: (): Command => ({ commands }) => {
        return commands.toggleMark('underline')
      },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-u': () => this.editor.underline(),
    }
  },
})

export default Underline

declare module '@tiptap/core/src/Editor' {
  interface AllExtensions {
    Underline: typeof Underline,
  }
}
