import { Mark, mergeAttributes } from '@tiptap/core'

export interface UnderlineOptions {
  HTMLAttributes: Record<string, any>,
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    underline: {
      /**
       * Set an underline mark
       */
      setUnderline: () => ReturnType,
      /**
       * Toggle an underline mark
       */
      toggleUnderline: () => ReturnType,
      /**
       * Unset an underline mark
       */
      unsetUnderline: () => ReturnType,
    }
  }
}

export const Underline = Mark.create<UnderlineOptions>({
  name: 'underline',

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  parseHTML() {
    return [
      {
        tag: 'u',
      },
      {
        style: 'text-decoration',
        consuming: false,
        getAttrs: style => ((style as string).includes('underline') ? {} : false),
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
