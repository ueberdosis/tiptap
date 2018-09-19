import { Node } from 'tiptap'
import { wrappingInputRule, wrapInList, toggleList } from 'tiptap-commands'
// import { EditorState } from 'prosemirror-state'

export default class AlignRight extends Node {

	get name() {
		return 'alignRight'
	}

	set align(state) {
		debugger
	}

	get schema() {
		return {
			content: 'inline*',
			group: 'block',
			draggable: false,
			parseDOM: [{
				tag: 'p',
			}],
			toDOM: () => ['p', 0],
		}
	}

	command(obj) {
		return toggleList(type, schema.nodes.list_item)
	}

	inputRules({ type }) {
		return [
			wrappingInputRule(/^\s*([-+*])\s$/, type),
		]
	}

}
