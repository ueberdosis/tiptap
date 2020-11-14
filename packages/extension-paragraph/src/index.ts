import { Command, createNode } from '@tiptap/core'

export interface ParagraphOptions {
  HTMLAttributes: {
    [key: string]: any
  },
}

const Paragraph = createNode({
  name: 'paragraph',

  defaultOptions: <ParagraphOptions>{
    HTMLAttributes: {},
  },

  group: 'block',

  content: 'inline*',

  parseHTML() {
    return [
      { tag: 'p' },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['p', HTMLAttributes, 0]
  },

  addCommands() {
    return {
      /**
       * Toggle a paragraph
       */
      paragraph: (): Command => ({ commands }) => {
        return commands.toggleBlockType('paragraph', 'paragraph')
      },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Alt-0': () => this.editor.commands.paragraph(),
    }
  },
})

export default Paragraph

declare module '@tiptap/core' {
  interface AllExtensions {
    Paragraph: typeof Paragraph,
  }
}
