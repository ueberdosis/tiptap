import { mergeAttributes, Node } from '@tiptap/core'

export interface HardBreakOptions {
  /**
   * Controls if marks should be kept after being split by a hard break.
   * @default true
   * @example false
   */
  keepMarks: boolean

  /**
   * HTML attributes to add to the hard break element.
   * @default {}
   * @example { class: 'foo' }
   */
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    hardBreak: {
      /**
       * Add a hard break
       * @example editor.commands.setHardBreak()
       */
      setHardBreak: () => ReturnType
    }
  }
}

/**
 * This extension allows you to insert hard breaks.
 * @see https://www.tiptap.dev/api/nodes/hard-break
 */
export const HardBreak = Node.create<HardBreakOptions>({
  name: 'hardBreak',

  markdownTokenName: 'br',

  addOptions() {
    return {
      keepMarks: true,
      HTMLAttributes: {},
    }
  },

  inline: true,

  group: 'inline',

  selectable: false,

  linebreakReplacement: true,

  parseHTML() {
    return [{ tag: 'br' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['br', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)]
  },

  renderText() {
    return '\n'
  },

  renderMarkdown: (_node, _helpers, ctx) => {
    const inBreakRun =
      ctx?.previousNode?.type === 'hardBreak' || ctx?.nextNode?.type === 'hardBreak'
    const atEdge = !ctx?.previousNode || !ctx?.nextNode

    // A spaces-only line is a paragraph break, so a run stays on one line.
    // Trailing spaces at either edge of a paragraph are trimmed, so use <br> there too.
    return inBreakRun || atEdge ? '<br>' : '  \n'
  },

  parseMarkdown: () => {
    return {
      type: 'hardBreak',
    }
  },

  addCommands() {
    return {
      setHardBreak:
        () =>
        ({ commands, chain, state, editor }) => {
          return commands.first([
            () => commands.exitCode(),
            () =>
              commands.command(() => {
                const { selection, storedMarks } = state

                if (selection.$from.parent.type.spec.isolating) {
                  return false
                }

                const { keepMarks } = this.options
                const { splittableMarks } = editor.extensionManager
                const marks = storedMarks || (selection.$to.parentOffset && selection.$from.marks())

                return chain()
                  .insertContent({ type: this.name })
                  .command(({ tr, dispatch }) => {
                    if (dispatch && marks && keepMarks) {
                      const filteredMarks = marks.filter(mark =>
                        splittableMarks.includes(mark.type.name),
                      )

                      tr.ensureMarks(filteredMarks)
                    }

                    return true
                  })
                  .scrollIntoView()
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
