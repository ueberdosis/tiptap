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
} from 'prosemirror-tables'
import { NodeView } from 'prosemirror-view'
import { TextSelection } from 'prosemirror-state'
import { createTable } from './utilities/createTable'
import { TableView } from './TableView'

export interface TableOptions {
  HTMLAttributes: {
    [key: string]: any
  },
  resizable: boolean,
  handleWidth: number,
  cellMinWidth: number,
  View: NodeView,
  lastColumnResizable: boolean,
  allowTableNodeSelection: boolean,
}

export const Table = Node.create({
  name: 'table',

  defaultOptions: <TableOptions>{
    HTMLAttributes: {},
    resizable: false,
    handleWidth: 5,
    cellMinWidth: 25,
    View: TableView,
    lastColumnResizable: true,
    allowTableNodeSelection: false,
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
      insertTable: ({ rows = 3, cols = 3, withHeaderRow = true }): Command => ({ state, dispatch }) => {
        const offset = state.tr.selection.anchor + 1
        const nodes = createTable(this.editor.schema, rows, cols, withHeaderRow)
        const tr = state.tr.replaceSelectionWith(nodes).scrollIntoView()
        const resolvedPos = tr.doc.resolve(offset)

        if (dispatch) {
          tr.setSelection(TextSelection.near(resolvedPos))
        }

        return true
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
      mergeOrSplit: (): Command => ({ state, dispatch }) => {
        if (mergeCells(state, dispatch)) {
          return true
        }

        return splitCell(state, dispatch)
      },
      setCellAttributes: ({ name, value }: { name: string, value: any }): Command => ({ state, dispatch }) => {
        return setCellAttr(name, value)(state, dispatch)
      },
      goToNextCell: (): Command => ({ state, dispatch }) => {
        return goToNextCell(1)(state, dispatch)
      },
      goToPreviousCell: (): Command => ({ state, dispatch }) => {
        return goToNextCell(-1)(state, dispatch)
      },
      fixTables: (): Command => ({ state, dispatch }) => {
        if (dispatch) {
          fixTables(state)
        }

        return true
      },
    }
  },

  addKeyboardShortcuts() {
    return {
      Tab: () => {
        if (this.editor.commands.goToNextCell()) {
          return true
        }

        if (!this.editor.can().addRowAfter()) {
          return false
        }

        return this.editor
          .chain()
          .addRowAfter()
          .goToNextCell()
          .run()
      },
      'Shift-Tab': () => this.editor.commands.goToPreviousCell(),
    }
  },

  addProseMirrorPlugins() {
    return [
      ...(this.options.resizable ? [columnResizing({
        handleWidth: this.options.handleWidth,
        cellMinWidth: this.options.cellMinWidth,
        View: this.options.View,
        // TODO: PR for @types/prosemirror-tables
        // @ts-ignore (incorrect type)
        lastColumnResizable: this.options.lastColumnResizable,
      })] : []),
      tableEditing({
        allowTableNodeSelection: this.options.allowTableNodeSelection,
      }),
    ]
  },
})

declare module '@tiptap/core' {
  interface AllExtensions {
    Table: typeof Table,
  }
}
