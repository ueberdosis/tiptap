import { Command, createNode } from '@tiptap/core'
import { chainCommands, exitCode } from 'prosemirror-commands'

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
      hardBreak: (): Command => ({ state, dispatch, view }) => {
        return chainCommands(
          exitCode,
          (_, d) => {
            if (typeof d !== 'function') {
              return false
            }

            d(state.tr.replaceSelectionWith(this.type.create()).scrollIntoView())

            return true
          },
        )(state, dispatch, view)
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

declare module '@tiptap/core/src/Editor' {
  interface AllExtensions {
    HardBreak: typeof HardBreak,
  }
}
