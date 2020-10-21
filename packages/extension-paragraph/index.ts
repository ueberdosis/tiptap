import { createNode } from '@tiptap/core'
// import { DOMOutputSpecArray } from 'prosemirror-model'
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

// export default class Paragraph extends Node implements INode {

//   name = 'paragraph'

//   group = 'block'

//   content = 'inline*'

//   createAttributes() {
//     return {
//       // default rendering
//       class: {
//         default: 'jooo',
//       },
//     }
//   }

//   parseHTML() {
//     return [
//       { tag: 'p' },
//     ]
//   }

//   renderHTML() {
//     return ['p', 0] as const
//   }

// }

export default createNode({
  name: 'paragraph',

  group: 'block',

  content: 'inline*',

  createAttributes() {
    return {
      id: {
        default: '123',
        renderHTML: attributes => ({ class: `foo-${attributes.id}`, id: 'foo' }),
      },
    }
  },

  parseHTML() {
    return [
      { tag: 'p' },
    ]
  },

  renderHTML({ attributes }) {
    return ['p', attributes, 0]
  },
})
