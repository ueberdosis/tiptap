import { Command, Mark, mergeAttributes } from '@tiptap/core'

export interface UnderlineOptions {
  HTMLAttributes: {
    [key: string]: any
  },
}

declare module '@tiptap/core' {
  interface Commands {
    setUnderline: () => Command,
    toggleUnderline: () => Command,
    unsetUnderline: () => Command,
  }
}

export const Underline = Mark.create({
  name: 'underline',

  defaultOptions: <UnderlineOptions>{
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
      /**
       * Set an underline mark
       */
      setUnderline: () => ({ commands }) => {
        return commands.setMark('underline')
      },
      /**
       * Toggle an underline mark
       */
      toggleUnderline: () => ({ commands }) => {
        return commands.toggleMark('underline')
      },
      /**
       * Unset an underline mark
       */
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
