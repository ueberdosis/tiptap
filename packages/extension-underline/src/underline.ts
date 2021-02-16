import { Command, Mark, mergeAttributes } from '@tiptap/core'

export interface UnderlineOptions {
  HTMLAttributes: {
    [key: string]: any
  },
}

declare module '@tiptap/core' {
  interface Commands {
    underline: {
      /**
       * Set an underline mark
       */
      setUnderline: () => Command,
      /**
       * Toggle an underline mark
       */
      toggleUnderline: () => Command,
      /**
       * Unset an underline mark
       */
      unsetUnderline: () => Command,
    }
  }
}

export const Underline = Mark.create<UnderlineOptions>({
  name: 'underline',

  defaultOptions: {
    HTMLAttributes: {},
  },

  parseHTML() {
    return [
      {
        tag: 'u',
      },
      {
        style: 'text-decoration=underline',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['u', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

  addCommands() {
    return {
      setUnderline: () => ({ commands }) => {
        return commands.setMark('underline')
      },
      toggleUnderline: () => ({ commands }) => {
        return commands.toggleMark('underline')
      },
      unsetUnderline: () => ({ commands }) => {
        return commands.unsetMark('underline')
      },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-u': () => this.editor.commands.toggleUnderline(),
    }
  },
})
