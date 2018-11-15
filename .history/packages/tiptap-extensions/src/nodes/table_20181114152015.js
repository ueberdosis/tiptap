import { Node } from 'tiptap'
import {
  tableEditing,
  columnResizing,
  goToNextCell,
  addColumnBefore,
	addColumnAfter,
	deleteColumn,
	addRowBefore,
	addRowAfter,
	deleteRow,
	deleteTable,
	mergeCells,
	splitCell,
	
} from 'prosemirror-tables'
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
			let command
			switch (attrs.type) {
				case 'addColumnBefore':
					command = addColumnBefore()
					break;
				case 'addColumnAfter':
					command = addColumnAfter()
					break;
				case 'deleteColumn':
					command = deleteColumn()
					break;
				case 'addRowBefore':
					command = addRowBefore()
					break;
				case 'addRowAfter':
					command = addRowAfter()
					break;
				case 'deleteRow':
					command = deleteRow()
					break;
				case 'deleteTable':
					command = deleteTable()
					break;
				case 'mergeCells':
					command = mergeCells()
					break;
				case 'splitCell':
					command = splitCell()
					break;
				case 'toggleHeaderColumn':
					command = toggleHeaderColumn()
					break;
				case 'toggleHeaderRow':
					command = toggleHeaderRow()
					break;
				case 'toggleHeaderCell':
					command = toggleHeaderCell()
					break;
			}
			return command
		}
	}

	keys({ type }) {
		return {
			'Tab': goToNextCell(1),
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

 item("Delete column", deleteColumn),
   item("Insert row before", addRowBefore),
   item("Insert row after", addRowAfter),
   item("Delete row", deleteRow),
   item("Delete table", deleteTable),
   item("Merge cells", mergeCells),
   item("Split cell", splitCell),
   item("Toggle header column", toggleHeaderColumn),
   item("Toggle header row", toggleHeaderRow),
   item("Toggle header cells", toggleHeaderCell),
   item("Make cell green", setCellAttr("background", "#dfd")),
   item("Make cell not-green", setCellAttr("background", null))
