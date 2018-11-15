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
	toggleHeaderColumn,
	toggleHeaderRow,
	toggleHeaderCell,
	setCellAttr
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

				switch (attrs.type) {
					case 'insert':
						let rows = attrs.options && attrs.options.rows
						let cols = attrs.options && attrs.options.cols
						let headerRow = attrs.options && attrs.options.headerRow
						const nodes = createTable(schema, rows, cols, headerRow)
						const transaction = state.tr.replaceSelectionWith(nodes).scrollIntoView()
						dispatch(transaction)
						break;
				  case 'addColumnBefore':
				    addColumnBefore()
				    break;
				  case 'addColumnAfter':
				    addColumnAfter()
				    break;
				  case 'deleteColumn':
				    deleteColumn()
				    break;
				  case 'addRowBefore':
				    addRowBefore()
				    break;
				  case 'addRowAfter':
				    addRowAfter()
				    break;
				  case 'deleteRow':
				    deleteRow()
				    break;
				  case 'deleteTable':
				    deleteTable(state, dispatch)
				    break;
				  case 'mergeCells':
				    mergeCells()
				    break;
				  case 'splitCell':
				    splitCell()
				    break;
				  case 'toggleHeaderColumn':
				    toggleHeaderColumn()
				    break;
				  case 'toggleHeaderRow':
				    toggleHeaderRow()
				    break;
				  case 'toggleHeaderCell':
				    toggleHeaderCell()
				    break;
				  case 'setCellBackground':
				    let color = (attrs.options && attrs.options.color) || '#dfd'
				    setCellAttr("background", color)
				    break;
				  case 'setCellBackgroundNull':
				    setCellAttr("background", null)
				    break;
				}
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
