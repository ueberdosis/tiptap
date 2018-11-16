import { Node } from 'tiptap'
import Table  from './table.nodes'

export default class TableHeaderNodes extends Node {

	get name() {
		return 'table_header'
	}

	get schema() {
		return Table['table_header']
	}

}
