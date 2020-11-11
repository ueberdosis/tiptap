import { Command, createNode } from '@tiptap/core'
import { exitCode } from 'prosemirror-commands'

const HardBreak = createNode({
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
      hardBreak: (): Command => ({ commands, state, dispatch }) => {
        return commands.try([
          () => exitCode(state, dispatch),
          () => {
            if (dispatch) {
              state.tr.replaceSelectionWith(this.type.create()).scrollIntoView()
            }

            return true
          },
        ])
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

export default HardBreak

declare module '@tiptap/core' {
  interface AllExtensions {
    HardBreak: typeof HardBreak,
  }
}
