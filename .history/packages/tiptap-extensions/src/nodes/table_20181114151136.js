import { Node } from 'tiptap'
import prosemirrorTables from 'prosemirror-tables'
import { createTable } from 'prosemirror-utils'
import Table  from './table.nodes'


export default class TableNodes extends Node {

	get name() {
		return 'table'
	}

	get schema() {
		return Table.table
	}

	command ({type, schema, attrs}) {
		if (attrs.type === 'insert') {
			return (state, dispatch) => {
				let rows = attrs.options && attrs.options.rows
				let cols = attrs.options && attrs.options.cols
				let headerRow = attrs.options && attrs.options.headerRow
			  const nodes = createTable(schema, rows, cols, headerRow)
			  const transaction = state.tr.replaceSelectionWith(nodes).scrollIntoView()
			  dispatch(transaction)
			}
		} else {
			switch (attrs.type) {
				case 'addColumnBefore':
				return
			}
		}
	}

	keys({ type }) {
		return {
			'Tab': prosemirrorTables.goToNextCell(1),
    	'Shift-Tab': goToNextCell(-1)
		}
	}

	get plugins() {
		return [
			columnResizing(),
  		tableEditing()
		]
	}

}
