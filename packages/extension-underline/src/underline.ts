import { Command, Mark, mergeAttributes } from '@tiptap/core'

export interface UnderlineOptions {
  HTMLAttributes: {
    [key: string]: any
  },
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
      setUnderline: (): Command => ({ commands }) => {
        return commands.setMark('underline')
      },
      /**
       * Toggle an underline mark
       */
      toggleUnderline: (): Command => ({ commands }) => {
        return commands.toggleMark('underline')
      },
      /**
       * Unset an underline mark
       */
      unsetUnderline: (): Command => ({ commands }) => {
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

declare module '@tiptap/core' {
  interface AllExtensions {
    Underline: typeof Underline,
  }
}
