import { Node } from 'tiptap'
import { wrappingInputRule, wrapInList, toggleList } from 'tiptap-commands'

export default class AlignLeft extends Node {

	get name() {
		return 'align_right'
	}

	get schema() {
		return {
			attrs: {
				class: "right"
			}
			// content: 'list_item+',
			group: 'block',
			parseDOM: [
				{ tag: 'p' },
				getAttrs: dom => ({
          src: dom.getAttribute('class'),
        })
			],
			toDOM: () => ['p', 0],
		}
	}

	command({ type, schema }) {
		return // toggleList(type, schema.nodes.list_item)
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
