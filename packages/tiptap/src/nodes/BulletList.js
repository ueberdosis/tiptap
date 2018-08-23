import { Node } from 'tiptap-models'
import { wrappingInputRule, wrapInList, toggleList } from 'tiptap-commands'

export default class BulletNode extends Node {

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

	command({ type, schema }) {
		return toggleList(type, schema.nodes.list_item)
	}

	keys({ type }) {
		return {
			'Shift-Ctrl-8': wrapInList(type),
		}
	}

	inputRules({ type }) {
		return [
			wrappingInputRule(/^\s*([-+*])\s$/, type),
		]
	}

}
