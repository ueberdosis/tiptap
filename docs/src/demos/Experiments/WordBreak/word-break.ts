import { Node, mergeAttributes } from '@tiptap/core'
import { exitCode } from 'prosemirror-commands'

export interface WordBreakOptions {
  HTMLAttributes: {
    [key: string]: any
  },
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    wordBreak: {
      /**
       * Add a hard break
       */
      setWordBreak: () => ReturnType,
    }
  }
}

export const WordBreak = Node.create<WordBreakOptions>({
  name: 'wordBreak',

  defaultOptions: {
    HTMLAttributes: {},
  },

  inline: true,

  group: 'inline',

  selectable: false,

  parseHTML() {
    return [
      { tag: 'wbr' },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['wbr', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)]
  },

  addCommands() {
    return {
      setWordBreak: () => ({ commands, state, dispatch }) => {
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

  addNodeView() {
    return () => {
      const dom = document.createElement('span')
      dom.classList.add('word-break')

      return {
        dom,
      }
    }
  },
})
