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
  setCellAttr,
  fixTables,
} from 'prosemirror-tables'
import { createTable } from 'prosemirror-utils'
import TableNodes from './TableNodes'

export default class Table extends Node {

  get name() {
    return 'table'
  }

  get schema() {
    return TableNodes.table
  }

  commands({ schema }) {
    return attrs => (state, dispatch) => {
      if (attrs.type) {
        switch (attrs.type) {
          case 'insert': {
            const rows = attrs.options && attrs.options.rows
            const cols = attrs.options && attrs.options.cols
            const headerRow = attrs.options && attrs.options.headerRow
            const nodes = createTable(schema, rows, cols, headerRow)
            const tr = state.tr.replaceSelectionWith(nodes).scrollIntoView()
            dispatch(tr)
            // table handle history
            const fix = fixTables(state)
            if (fix) Object.assign(state, state.apply(fix.setMeta('addToHistory', false)))
            break
          }
          case 'addColumnBefore': {
            addColumnBefore(state, dispatch)
            break
          }
          case 'addColumnAfter': {
            addColumnAfter(state, dispatch)
            break
          }
          case 'deleteColumn': {
            deleteColumn(state, dispatch)
            break
          }
          case 'addRowBefore': {
            addRowBefore(state, dispatch)
            break
          }
          case 'addRowAfter': {
            addRowAfter(state, dispatch)
            break
          }
          case 'deleteRow': {
            deleteRow(state, dispatch)
            break
          }
          case 'deleteTable': {
            deleteTable(state, dispatch)
            break
          }
          case 'mergeCells': {
            mergeCells(state, dispatch)
            break
          }
          case 'splitCell': {
            splitCell(state, dispatch)
            break
          }
          case 'toggleHeaderColumn': {
            toggleHeaderColumn(state, dispatch)
            break
          }
          case 'toggleHeaderRow': {
            toggleHeaderRow(state, dispatch)
            break
          }
          case 'toggleHeaderCell': {
            toggleHeaderCell(state, dispatch)
            break
          }
          case 'setCellBackground': {
            const color = (attrs.options && attrs.options.color) || '#dfd'
            setCellAttr('background', color)(state, dispatch)
            break
          }
          case 'setCellBackgroundNull': {
            setCellAttr('background', null)(state, dispatch)
            break
          }
          default: {
            const transaction = state.tr
            dispatch(transaction)
            break
          }
        }
      }
    }
  }

  keys() {
    return {
      Tab: goToNextCell(1),
      'Shift-Tab': goToNextCell(-1),
    }
  }

  get plugins() {
    return [
      columnResizing(),
      tableEditing(),
    ]
  }

}
