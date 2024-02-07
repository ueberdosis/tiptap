import {
  isMacOS,
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

export const inputRegex = /(?:^|\s)(~~(?!\s+~~)((?:[^~]+))~~(?!\s+~~))$/
export const pasteRegex = /(?:^|\s)(~~(?!\s+~~)((?:[^~]+))~~(?!\s+~~))/g

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
    const shortcuts: Record<string, () => boolean> = {}

    if (isMacOS()) {
      shortcuts['Mod-Shift-s'] = () => this.editor.commands.toggleStrike()
    } else {
      shortcuts['Ctrl-Shift-s'] = () => this.editor.commands.toggleStrike()
    }

    return shortcuts
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
