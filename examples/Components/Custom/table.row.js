import { Node } from 'tiptap'
import Table  from './table.nodes'

export default class TableRowNodes extends Node {

	get name() {
		return 'table_row'
	}

	get schema() {
		return Table['table_row']
	}

}
