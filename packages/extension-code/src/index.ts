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
       * Toggle inline code
       */
      code: (): Command => ({ commands }) => {
        return commands.toggleMark('code')
      },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-`': () => this.editor.commands.code(),
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

declare global {
  namespace Tiptap {
    interface AllExtensions {
      Code: typeof Code,
    }
  }
}
