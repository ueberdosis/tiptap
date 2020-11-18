import {
  Command,
  Mark,
  markInputRule,
  markPasteRule,
} from '@tiptap/core'

export interface CodeOptions {
  HTMLAttributes: {
    [key: string]: any
  },
}

export const inputRegex = /(?:^|\s)((?:`)((?:[^`]+))(?:`))$/gm
export const pasteRegex = /(?:^|\s)((?:`)((?:[^`]+))(?:`))/gm

const Code = Mark.create({
  name: 'code',

  defaultOptions: <CodeOptions>{
    HTMLAttributes: {},
  },

  excludes: '_',

  parseHTML() {
    return [
      { tag: 'code' },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['code', HTMLAttributes, 0]
  },

  addCommands() {
    return {
      /**
       * Set a code mark
       */
      setCode: (): Command => ({ commands }) => {
        return commands.setMark('code')
      },
      /**
       * Toggle inline code
       */
      toggleCode: (): Command => ({ commands }) => {
        return commands.toggleMark('code')
      },
      /**
       * Unset a code mark
       */
      unsetCode: (): Command => ({ commands }) => {
        return commands.removeMark('code')
      },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-`': () => this.editor.commands.toggleCode(),
    }
  },

  addInputRules() {
    return [
      markInputRule(inputRegex, this.type),
    ]
  },

  addPasteRules() {
    return [
      markPasteRule(inputRegex, this.type),
    ]
  },
})

export default Code

declare module '@tiptap/core' {
  interface AllExtensions {
    Code: typeof Code,
  }
}
