import { Node } from 'tiptap/utils'
import { wrapInList, wrappingInputRule } from 'tiptap/helpers'

export default class BulletNode extends Node {

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

	command({ type }) {
		return wrapInList(type)
	}

	inputRules({ type }) {
		return [
			wrappingInputRule(/^\s*(\[ \])\s$/, type),
		]
	}

}
