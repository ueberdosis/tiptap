import { Command, Node } from '@tiptap/core'
// import ParagraphComponent from './paragraph.vue'

// export type ParagraphCommand = () => Command

// declare module '@tiptap/core/src/Editor' {
//   interface Commands {
//     paragraph: ParagraphCommand,
//   }
// }

// export default new Node()
//   .name('paragraph')
//   .schema(() => ({
//     content: 'inline*',
//     group: 'block',
//     parseDOM: [{ tag: 'p' }],
//     toDOM: () => ['p', 0],
//     // toVue: ParagraphComponent,
//   }))
//   .commands(({ name }) => ({
//     [name]: () => ({ commands }) => {
//       return commands.toggleBlockType(name, 'paragraph')
//     },
//   }))
//   .keys(({ editor }) => ({
//     'Mod-Alt-0': () => editor.paragraph(),
//   }))
//   .create()

export default class Paragraph extends Node {

  name = 'paragraph'

  group = 'block'

  content = 'inline*'

  parseHTML() {
    return [
      { tag: 'p' },
    ]
  }

  renderHTML() {
    return ['p', 0]
  }

}
