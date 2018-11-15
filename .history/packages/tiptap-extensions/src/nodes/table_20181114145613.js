import { Node, Plugin } from 'tiptap'
import {tableEditing, columnResizing, fixTables, goToNextCell} from 'prosemirror-tables'
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
		
		return (state, dispatch) => {
	      const { selection } = state
	      const position = selection.$cursor ? selection.$cursor.pos : selection.$to.pos
	      const nodes = createTable(schema, attrs.rows, attrs.cols, attrs.headerRow)
	      const transaction = state.tr.replaceSelectionWith(nodes).scrollIntoView()
	      dispatch(transaction)
	    }
	}

	keys({ type }) {
		return {
			"Tab": goToNextCell(1),
    		"Shift-Tab": goToNextCell(-1)
		}
	}

	get plugins() {
		return [
			columnResizing(),
  			tableEditing(),
		]
	}

}
