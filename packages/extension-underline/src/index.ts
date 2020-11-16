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
      underline: (): Command => ({ commands }) => {
        return commands.toggleMark('underline')
      },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-u': () => this.editor.commands.underline(),
    }
  },
})

export default Underline

declare module '@tiptap/core' {
  interface AllExtensions {
    Underline: typeof Underline,
  }
}
