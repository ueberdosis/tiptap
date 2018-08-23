import { Node } from '../utils'
import { wrappingInputRule, wrapInList, toggleList } from 'tiptap-commands'

export default class OrderedListNode extends Node {

	get name() {
		return 'ordered_list'
	}

	get schema() {
		return {
			attrs: {
				order: {
					default: 1,
				},
			},
			content: 'list_item+',
			group: 'block',
			parseDOM: [
				{
					tag: 'ol',
					getAttrs: dom => ({
						order: dom.hasAttribute('start') ? +dom.getAttribute('start') : 1,
					}),
				},
			],
			toDOM: node => (node.attrs.order === 1 ? ['ol', 0] : ['ol', { start: node.attrs.order }, 0]),
		}
	}

	command({ type, schema }) {
		return toggleList(type, schema.nodes.list_item)
	}

	keys({ type }) {
		return {
			'Shift-Ctrl-9': wrapInList(type),
		}
	}

	inputRules({ type }) {
		return [
			wrappingInputRule(
				/^(\d+)\.\s$/,
				type,
				match => ({ order: +match[1] }),
				(match, node) => node.childCount + node.attrs.order === +match[1],
			),
		]
	}

}
