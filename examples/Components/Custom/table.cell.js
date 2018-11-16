import { Node } from 'tiptap'
import Table  from './table.nodes'

export default class TableCellNodes extends Node {

	get name() {
		return 'table_cell'
	}

	get schema() {
		return Table['table_cell']
	}

}
