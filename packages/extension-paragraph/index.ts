import { Node } from '@tiptap/core'
// import ParagraphComponent from './paragraph.vue'

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
  .keys(({ editor, name }) => ({
    // Exception: TS2339: Property 'paragraph' does not exist on type 'Editor'.
    // 'Mod-Alt-0': () => editor.paragraph(),
    'Mod-Alt-0': () => editor.toggleNode(name, 'paragraph'),
  }))
  .create()
