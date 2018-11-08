import { Node } from 'tiptap'
import { toggleBlockType, setBlockType, textblockTypeInputRule } from 'tiptap-commands'

export default class CodeBlock extends Node {

  get name() {
    return 'code_block'
  }

  get schema() {
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

  commands({ type, schema }) {
    return () => toggleBlockType(type, schema.nodes.paragraph)
  }

  keys({ type }) {
    return {
      'Shift-Ctrl-\\': setBlockType(type),
    }
  }

  inputRules({ type }) {
    return [
      textblockTypeInputRule(/^```$/, type),
    ]
  }

}
