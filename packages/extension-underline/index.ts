import { Command, createMark } from '@tiptap/core'

// export type UnderlineCommand = () => Command

// declare module '@tiptap/core/src/Editor' {
//   interface Commands {
//     underline: UnderlineCommand,
//   }
// }

export default createMark({
  name: 'underline',

  parseHTML() {
    return [
      {
        tag: 'u',
      },
      {
        style: 'text-decoration',
        getAttrs: node => (node === 'underline' ? {} : false),
      },
    ]
  },

  renderHTML({ attributes }) {
    return ['u', attributes, 0]
  },

  addCommands() {
    return {
      underline: () => ({ commands }) => {
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
