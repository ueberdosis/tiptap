// @ts-nocheck
import { Command, Node, mergeAttributes } from '@tiptap/core'
import {
  tableEditing,
  columnResizing,
  // goToNextCell,
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
import { TableView } from './TableView'

export interface TableOptions {
  HTMLAttributes: {
    [key: string]: any
  },
  resizable: boolean,
}

export const Table = Node.create({
  name: 'table',

  defaultOptions: <TableOptions>{
    HTMLAttributes: {},
    resizable: false,
  },

  content: 'table_row+',

  tableRole: 'table',

  isolating: true,

  group: 'block',

  parseHTML() {
    return [{ tag: 'table' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['table', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), ['tbody', 0]]
  },

  addCommands() {
    return {
      // createTable: ({ rowsCount, colsCount, withHeaderRow }) => (
      //   (state, dispatch) => {
      //     const offset = state.tr.selection.anchor + 1

      //     const nodes = createTable(schema, rowsCount, colsCount, withHeaderRow)
      //     const tr = state.tr.replaceSelectionWith(nodes).scrollIntoView()
      //     const resolvedPos = tr.doc.resolve(offset)

      //     tr.setSelection(TextSelection.near(resolvedPos))

      //     dispatch(tr)
      //   }
      // ),
      addColumnBefore: (): Command => ({ state, dispatch }) => {
        console.log('addColumnBefore')
        return addColumnBefore(state, dispatch)
      },
      addColumnAfter: (): Command => ({ state, dispatch }) => {
        console.log('addColumnAfter')
        return addColumnAfter(state, dispatch)
      },
      deleteColumn: (): Command => ({ state, dispatch }) => {
        console.log('deleteColumn')
        return deleteColumn(state, dispatch)
      },
      addRowBefore: (): Command => ({ state, dispatch }) => {
        console.log('addRowBefore')
        return addRowBefore(state, dispatch)
      },
      addRowAfter: (): Command => ({ state, dispatch }) => {
        console.log('addRowAfter')
        return addRowAfter(state, dispatch)
      },
      deleteRow: (): Command => ({ state, dispatch }) => {
        console.log('deleteRow')
        return deleteRow(state, dispatch)
      },
      deleteTable: (): Command => ({ state, dispatch }) => {
        console.log('deleteTable')
        return deleteTable(state, dispatch)
      },
      mergeCells: (): Command => ({ state, dispatch }) => {
        console.log('mergeCells')
        return mergeCells(state, dispatch)
      },
      splitCell: (): Command => ({ state, dispatch }) => {
        console.log('splitCell')
        return splitCell(state, dispatch)
      },
      toggleHeaderColumn: (): Command => ({ state, dispatch }) => {
        console.log('toggleHeaderColumn')
        return toggleHeaderColumn(state, dispatch)
      },
      toggleHeaderRow: (): Command => ({ state, dispatch }) => {
        console.log('toggleHeaderRow')
        return toggleHeaderRow(state, dispatch)
      },
      toggleHeaderCell: (): Command => ({ state, dispatch }) => {
        console.log('toggleHeaderCell')
        return toggleHeaderCell(state, dispatch)
      },
      fixTables: (): Command => ({ state, dispatch }) => {
        console.log('fixTables')
        const transaction = fixTables(state)

        console.log(transaction)
        if (transaction) {
          // @ts-ignore
          return dispatch(transaction)
        }

        return false
      },
      // toggleCellMerge: () => (
      //     (state, dispatch) => {
      //       if (mergeCells(state, dispatch)) {
      //         return
      //       }
      //       splitCell(state, dispatch)
      //     }
      // ),
      // setCellAttr: ({ name, value }): Command => () => {
      //   console.log('setCellAttr')
      //   return setCellAttr(name, value)
      // },
    }
  },

  addProseMirrorPlugins() {
    const columnResizingOptions = {
      handleWidth: 5,
      cellMinWidth: 25,
      View: TableView,
      lastColumnResizable: true,
    }

    const tableEditingOptions = {
      allowTableNodeSelection: false,
    }

    return [
      ...(this.options.resizable
        // @ts-ignore
        ? [columnResizing(columnResizingOptions)]
        : []
      ),
      tableEditing(tableEditingOptions),
    ]
  },
})

declare module '@tiptap/core' {
  interface AllExtensions {
    Table: typeof Table,
  }
}
