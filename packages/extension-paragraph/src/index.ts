import { Command, createNode } from '@tiptap/core'
// import ParagraphComponent from './paragraph.vue'

const Paragraph = createNode({
  name: 'paragraph',

  group: 'block',

  content: 'inline*',

  parseHTML() {
    return [
      { tag: 'p' },
    ]
  },

  renderHTML({ attributes }) {
    return ['p', attributes, 0]
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
