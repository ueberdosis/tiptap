import { Node } from '@tiptap/core'
import { NodeSpec } from 'prosemirror-model'

export default class CodeBlock extends Node {

  name = 'code_block'

  schema(): NodeSpec {
    return {
      content: 'text*',
      marks: '',
      group: 'block',
      code: true,
      defining: true,
      draggable: false,
      parseDOM: [
        { tag: 'pre', preserveWhitespace: 'full' },
      ],
      toDOM: () => ['pre', ['code', 0]],
    }
  }

}