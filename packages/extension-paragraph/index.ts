import { Command, createNode } from '@tiptap/core'
// import ParagraphComponent from './paragraph.vue'

const Paragraph = createNode({
  name: 'paragraph',

  group: 'block',

  content: 'inline*',

  // addGlobalAttributes() {
  //   return [
  //     {
  //       types: ['paragraph'],
  //       attributes: {
  //         align: {
  //           default: 'right',
  //           renderHTML: attributes => ({
  //             class: 'foo',
  //             style: `text-align: ${attributes.align}`,
  //           }),
  //         },
  //       },
  //     },
  //   ]
  // },

  // addAttributes() {
  //   return {
  //     id: {
  //       default: '123',
  //       rendered: true,
  //       renderHTML: attributes => ({
  //         class: 'bar',
  //         style: 'color: red',
  //       }),
  //     },
  //   }
  // },

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
      paragraph: (): Command => ({ commands }) => {
        return commands.toggleBlockType('paragraph', 'paragraph')
      },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Alt-0': () => this.editor.paragraph(),
    }
  },
})

export default Paragraph

declare module '@tiptap/core/src/Editor' {
  interface AllExtensions {
    Paragraph: typeof Paragraph,
  }
}
