import { Node } from 'tiptap'
import { wrappingInputRule, toggleList } from 'tiptap-commands'

export default class BulletList extends Node {

  get name() {
    return 'bullet_list'
  }

  get schema() {
    return {
      content: 'list_item+',
      group: 'block',
      parseDOM: [
        { tag: 'ul' },
      ],
      toDOM: () => ['ul', 0],
    }
  }

  commands({ type, schema }) {
    return () => toggleList(type, schema.nodes.list_item)
  }

  keys({ type, schema }) {
    return {
      'Shift-Ctrl-8': toggleList(type, schema.nodes.list_item),
    }
  }

  inputRules({ type }) {
    return [
      wrappingInputRule(/^\s*([-+*])\s$/, type),
    ]
  }

}
