// @ts-nocheck
import { Command, Node, mergeAttributes } from '@tiptap/core'
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
  CellSelection,
} from 'prosemirror-tables'
import { TextSelection } from 'prosemirror-state'
import { createTable } from './utilities/createTable'
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

  content: 'tableRow+',

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
      createTable: ({ rows, cols, withHeaderRow }): Command => ({ state, dispatch }) => {
        const offset = state.tr.selection.anchor + 1

        const nodes = createTable(this.editor.schema, rows, cols, withHeaderRow)
        const tr = state.tr.replaceSelectionWith(nodes).scrollIntoView()
        const resolvedPos = tr.doc.resolve(offset)

        tr.setSelection(TextSelection.near(resolvedPos))

        return dispatch(tr)
      },
      addColumnBefore: (): Command => ({ state, dispatch }) => {
        return addColumnBefore(state, dispatch)
      },
      addColumnAfter: (): Command => ({ state, dispatch }) => {
        return addColumnAfter(state, dispatch)
      },
      deleteColumn: (): Command => ({ state, dispatch }) => {
        return deleteColumn(state, dispatch)
      },
      addRowBefore: (): Command => ({ state, dispatch }) => {
        return addRowBefore(state, dispatch)
      },
      addRowAfter: (): Command => ({ state, dispatch }) => {
        return addRowAfter(state, dispatch)
      },
      deleteRow: (): Command => ({ state, dispatch }) => {
        return deleteRow(state, dispatch)
      },
      deleteTable: (): Command => ({ state, dispatch }) => {
        return deleteTable(state, dispatch)
      },
      mergeCells: (): Command => ({ state, dispatch }) => {
        console.log('mergeCells', { state }, state.selection instanceof CellSelection)
        return mergeCells(state, dispatch)
      },
      splitCell: (): Command => ({ state, dispatch }) => {
        return splitCell(state, dispatch)
      },
      toggleHeaderColumn: (): Command => ({ state, dispatch }) => {
        return toggleHeaderColumn(state, dispatch)
      },
      toggleHeaderRow: (): Command => ({ state, dispatch }) => {
        return toggleHeaderRow(state, dispatch)
      },
      toggleHeaderCell: (): Command => ({ state, dispatch }) => {
        return toggleHeaderCell(state, dispatch)
      },
      fixTables: (): Command => ({ state, dispatch }) => {
        const transaction = fixTables(state)

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
      setCellAttributes: ({ name, value }): Command => ({ state, dispatch }) => {
        return setCellAttr(name, value)(state, dispatch)
      },
      goToNextCell: (): Command => ({ state, dispatch }) => {
        return goToNextCell(1)(state, dispatch)
      },
      goToPreviousCell: (): Command => ({ state, dispatch }) => {
        return goToNextCell(-1)(state, dispatch)
      },
    }
  },

  addKeyboardShortcuts() {
    return {
      Tab: () => {
        if (this.editor.commands.goToNextCell()) {
          return true
        }

        if (this.editor.commands.addRowAfter()) {
          return this.editor.commands.goToNextCell()
        }

        return false
      },
      'Shift-Tab': () => this.editor.commands.goToPreviousCell(),
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
