import { Command, Node, mergeAttributes } from '@tiptap/core'
import { exitCode } from 'prosemirror-commands'

export interface HardBreakOptions {
  HTMLAttributes: {
    [key: string]: any
  },
}

const HardBreak = Node.create({
  name: 'hardBreak',

  defaultOptions: <HardBreakOptions>{
    languageClassPrefix: 'language-',
    HTMLAttributes: {},
  },

  inline: true,

  group: 'inline',

  selectable: false,

  parseHTML() {
    return [
      { tag: 'br' },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['br', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)]
  },

  addCommands() {
    return {
      /**
       * Add a hard break
       */
      setHardBreak: (): Command => ({ commands, state, dispatch }) => {
        return commands.first([
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
      'Mod-Enter': () => this.editor.commands.setHardBreak(),
      'Shift-Enter': () => this.editor.commands.setHardBreak(),
    }
  },
})

export default HardBreak

declare module '@tiptap/core' {
  interface AllExtensions {
    HardBreak: typeof HardBreak,
  }
}
