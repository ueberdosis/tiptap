import { Node } from 'tiptap'
import { createTable } from 'prosemirror-utils'

export default class TableNodes extends Node {

	get name() {
		return 'table'
	}

	get schema() {
		return {
			content: 'block*',
			group: 'block',
			defining: true,
			draggable: false,
			parseDOM: [
				{ tag: 'table' },
			],
			toDOM: () => ['table', 0]
		}
	}

	command ({schema}) {
		return createTable(schema.nodes.table)
	}

}
