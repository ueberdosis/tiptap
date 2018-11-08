import { Node } from 'tiptap'
import { wrappingInputRule, toggleWrap } from 'tiptap-commands'

export default class Blockquote extends Node {

  get name() {
    return 'blockquote'
  }

  get schema() {
    return {
      content: 'block*',
      group: 'block',
      defining: true,
      draggable: false,
      parseDOM: [
        { tag: 'blockquote' },
      ],
      toDOM: () => ['blockquote', 0],
    }
  }

  commands({ type, schema }) {
    return () => toggleWrap(type, schema.nodes.paragraph)
  }

  keys({ type }) {
    return {
      'Ctrl->': toggleWrap(type),
    }
  }

  inputRules({ type }) {
    return [
      wrappingInputRule(/^\s*>\s$/, type),
    ]
  }

}
