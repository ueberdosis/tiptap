import { Node } from '@tiptap/core'
import { NodeSpec } from 'prosemirror-model'

export default class Paragraph extends Node {

  name = 'paragraph'

  schema(): NodeSpec {
    return {
      content: 'inline*',
      group: 'block',
      parseDOM: [{ tag: 'p' }],
      toDOM: () => ['p', 0],
    }
  }

}