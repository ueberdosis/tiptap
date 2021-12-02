import {
  Mark,
  markInputRule,
  markPasteRule,
  mergeAttributes,
} from '@tiptap/core'

export interface StrikeOptions {
  HTMLAttributes: Record<string, any>,
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    strike: {
      /**
       * Set a strike mark
       */
      setStrike: () => ReturnType,
      /**
       * Toggle a strike mark
       */
      toggleStrike: () => ReturnType,
      /**
       * Unset a strike mark
       */
      unsetStrike: () => ReturnType,
    }
  }
}

export const inputRegex = /(?:^|\s)((?:~~)((?:[^~]+))(?:~~))$/
export const pasteRegex = /(?:^|\s)((?:~~)((?:[^~]+))(?:~~))/g

export const Strike = Mark.create<StrikeOptions>({
  name: 'strike',

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  parseHTML() {
    return [
      {
        tag: 's',
      },
      {
        tag: 'del',
      },
      {
        tag: 'strike',
      },
      {
        style: 'text-decoration',
        consuming: false,
        getAttrs: style => ((style as string).includes('line-through') ? {} : false),
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['s', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

  addCommands() {
    return {
      setStrike: () => ({ commands }) => {
        return commands.setMark(this.name)
      },
      toggleStrike: () => ({ commands }) => {
        return commands.toggleMark(this.name)
      },
      unsetStrike: () => ({ commands }) => {
        return commands.unsetMark(this.name)
      },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-x': () => this.editor.commands.toggleStrike(),
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
