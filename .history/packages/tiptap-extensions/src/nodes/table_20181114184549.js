import {
  Node
} from 'tiptap'
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
import {
  createTable,
  setCellAttrs,
  findCellClosestToPos
} from 'prosemirror-utils'
import Table from './table.nodes'

export default class TableNodes extends Node {

  get name() {
    return 'table'
  }

  get schema() {
    return Table.table
  }

  command({
    type,
    schema,
    attrs
  }) {
    return (state, dispatch) => {
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
          addColumnBefore(state, dispatch)
          break;
        case 'addColumnAfter':
          addColumnAfter(state, dispatch)
          break;
        case 'deleteColumn':
          deleteColumn(state, dispatch)
          break;
        case 'addRowBefore':
          addRowBefore(state, dispatch)
          break;
        case 'addRowAfter':
          addRowAfter(state, dispatch)
          break;
        case 'deleteRow':
          deleteRow(state, dispatch)
          break;
        case 'deleteTable':
          deleteTable(state, dispatch)
          break;
        case 'mergeCells':
          mergeCells(state, dispatch)
          break;
        case 'splitCell':
          splitCell(state, dispatch)
          break;
        case 'toggleHeaderColumn':
          toggleHeaderColumn(state, dispatch)
          break;
        case 'toggleHeaderRow':
          toggleHeaderRow(state, dispatch)
          break;
        case 'toggleHeaderCell':
          toggleHeaderCell(state, dispatch)
          break;
        case 'setCellBackground':
					let color = (attrs.options && attrs.options.color) || '#dfd'
					console.log('------', state)
          dispatch(setCellAttrs(findCellClosestToPos(selection), {
            background: color
          })(state.tr))
          break;
        case 'setCellBackgroundNull':
          setCellAttr("background", null)
          break;
      }
    }
  }

  keys({
    type
  }) {
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
