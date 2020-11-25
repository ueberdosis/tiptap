import { Command, Node, mergeAttributes } from '@tiptap/core'

export interface ParagraphOptions {
  HTMLAttributes: {
    [key: string]: any
  },
}

const Paragraph = Node.create({
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
    return ['p', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

  addCommands() {
    return {
      /**
       * Toggle a paragraph
       */
      setParagraph: (): Command => ({ commands }) => {
        return commands.toggleNode('paragraph', 'paragraph')
      },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Alt-0': () => this.editor.commands.setParagraph(),
    }
  },
})

export default Paragraph

declare module '@tiptap/core' {
  interface AllExtensions {
    Paragraph: typeof Paragraph,
  }
}
