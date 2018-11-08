import { Node } from 'tiptap'
import { wrapInList, wrappingInputRule } from 'tiptap-commands'

export default class TodoList extends Node {

  get name() {
    return 'todo_list'
  }

  get schema() {
    return {
      group: 'block',
      content: 'todo_item+',
      toDOM: () => ['ul', { 'data-type': 'todo_list' }, 0],
      parseDOM: [{
        priority: 51,
        tag: '[data-type="todo_list"]',
      }],
    }
  }

  commands({ type }) {
    return () => wrapInList(type)
  }

  inputRules({ type }) {
    return [
      wrappingInputRule(/^\s*(\[ \])\s$/, type),
    ]
  }

}
