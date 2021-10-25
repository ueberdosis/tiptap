import { Node, mergeAttributes } from '@tiptap/core'

export interface HardBreakOptions {
  keepMarks: boolean,
  HTMLAttributes: Record<string, any>,
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    hardBreak: {
      /**
       * Add a hard break
       */
      setHardBreak: () => ReturnType,
    }
  }
}

export const HardBreak = Node.create<HardBreakOptions>({
  name: 'hardBreak',

  addOptions() {
    return {
      keepMarks: true,
      HTMLAttributes: {},
    }
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

  renderText() {
    return '\n'
  },

  addCommands() {
    return {
      setHardBreak: () => ({
        commands,
        chain,
        state,
        editor,
      }) => {
        return commands.first([
          () => commands.exitCode(),
          () => commands.command(() => {
            const { keepMarks } = this.options
            const { splittableMarks } = editor.extensionManager
            const marks = state.storedMarks
              || (state.selection.$to.parentOffset && state.selection.$from.marks())

            return chain()
              .insertContent({ type: this.name })
              .command(({ tr, dispatch }) => {
                if (dispatch && marks && keepMarks) {
                  const filteredMarks = marks
                    .filter(mark => splittableMarks.includes(mark.type.name))

                  tr.ensureMarks(filteredMarks)
                }

                return true
              })
              .run()
          }),
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
