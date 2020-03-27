import { Node } from '@tiptap/core'

export default class Paragraph extends Node {

  name = 'paragraph'

  schema = {
    content: 'inline*',
    group: 'block',
    draggable: false,
    parseDOM: [{ tag: 'p' }],
    toDOM: () => ['p', 0],
  }

}