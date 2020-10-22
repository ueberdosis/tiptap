import { Command, createNode } from '@tiptap/core'
import { chainCommands, exitCode } from 'prosemirror-commands'

// export type HardBreakCommand = () => Command

// declare module '@tiptap/core/src/Editor' {
//   interface Commands {
//     hardBreak: HardBreakCommand,
//   }
// }

export default createNode({
  name: 'hardBreak',

  inline: true,

  group: 'inline',

  selectable: false,

  parseHTML() {
    return [
      { tag: 'br' },
    ]
  },

  renderHTML({ attributes }) {
    return ['br', attributes]
  },

  addCommands() {
    return {
      hardBreak: () => ({
        tr, state, dispatch, view,
      }) => {
        return chainCommands(exitCode, () => {
          dispatch(tr.replaceSelectionWith(this.type.create()).scrollIntoView())
          return true
        })(state, dispatch, view)
      },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Enter': () => this.editor.hardBreak(),
      'Shift-Enter': () => this.editor.hardBreak(),
    }
  },
})
