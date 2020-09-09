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
  .create()