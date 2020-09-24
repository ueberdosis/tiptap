import { Command, Node } from '@tiptap/core'
// import ParagraphComponent from './paragraph.vue'

export type ParagraphCommand = () => Command

declare module '@tiptap/core/src/Editor' {
  interface Commands {
    paragraph: ParagraphCommand,
  }
}

export default new Node()
  .name('paragraph')
  .schema(() => ({
    content: 'inline*',
    group: 'block',
    parseDOM: [{ tag: 'p' }],
    toDOM: () => ['p', 0],
    // toVue: ParagraphComponent,
  }))
  .commands(({ name }) => ({
    [name]: () => ({ commands }) => {
      return commands.toggleNode(name, 'paragraph')
    },
  }))
  .keys(({ editor }) => ({
    'Mod-Alt-0': () => editor.paragraph(),
  }))
  .create()
