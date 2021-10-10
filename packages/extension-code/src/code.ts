import {
  Mark,
  markInputRule,
  markPasteRule,
  mergeAttributes,
} from '@tiptap/core'

export interface CodeOptions {
  HTMLAttributes: Record<string, any>,
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    code: {
      /**
       * Set a code mark
       */
      setCode: () => ReturnType,
      /**
       * Toggle inline code
       */
      toggleCode: () => ReturnType,
      /**
       * Unset a code mark
       */
      unsetCode: () => ReturnType,
    }
  }
}

export const inputRegex = /(?:^|\s)((?:`)((?:[^`]+))(?:`))$/
export const pasteRegex = /(?:^|\s)((?:`)((?:[^`]+))(?:`))/g

export const Code = Mark.create<CodeOptions>({
  name: 'code',

  defaultOptions: {
    HTMLAttributes: {},
  },

  excludes: '_',

  code: true,

  parseHTML() {
    return [
      { tag: 'code' },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['code', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

  addCommands() {
    return {
      setCode: () => ({ commands }) => {
        return commands.setMark('code')
      },
      toggleCode: () => ({ commands }) => {
        return commands.toggleMark('code')
      },
      unsetCode: () => ({ commands }) => {
        return commands.unsetMark('code')
      },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-e': () => this.editor.commands.toggleCode(),
    }
  },

  addInputRules() {
    return [
      markInputRule({
        find: inputRegex,
        type: this.type,
      }),
    ]
  },

  addPasteRules() {
    return [
      markPasteRule({
        find: pasteRegex,
        type: this.type,
      }),
    ]
  },
})
