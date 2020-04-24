import { Node } from '@tiptap/core'
import { NodeSpec } from 'prosemirror-model'
import ParagraphComponent from './paragraph.vue'

export default class Paragraph extends Node {

  name = 'paragraph'

  schema(): NodeSpec {
    return {
      content: 'inline*',
      group: 'block',
      parseDOM: [{ tag: 'p' }],
      toDOM: () => ['p', 0],
      // toVue: ParagraphComponent,
    }
  }

}