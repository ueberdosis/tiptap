import { Command, Mark } from '@tiptap/core'

export interface UnderlineOptions {
  HTMLAttributes: {
    [key: string]: any
  },
}

const Underline = Mark.create({
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
    return ['u', HTMLAttributes, 0]
  },

  addCommands() {
    return {
      /**
       * Set a underline mark
       */
      setUnderline: (): Command => ({ commands }) => {
        return commands.addMark('underline')
      },
      /**
       * Toggle a underline mark
       */
      toggleUnderline: (): Command => ({ commands }) => {
        return commands.toggleMark('underline')
      },
      /**
       * Set a underline mark
       */
      unsetUnderline: (): Command => ({ commands }) => {
        return commands.addMark('underline')
      },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-u': () => this.editor.commands.toggleUnderline(),
    }
  },
})

export default Underline

declare module '@tiptap/core' {
  interface AllExtensions {
    Underline: typeof Underline,
  }
}
