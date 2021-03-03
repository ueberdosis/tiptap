import {
  Command,
  Node,
  mergeAttributes,
  findParentNodeClosestToPos,
  callOrReturn,
} from '@tiptap/core'
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
import { isCellSelection } from './utilities/isCellSelection'
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

declare module '@tiptap/core' {
  interface Commands {
    table: {
      insertTable: (options?: { rows?: number, cols?: number, withHeaderRow?: boolean }) => Command,
      addColumnBefore: () => Command,
      addColumnAfter: () => Command,
      deleteColumn: () => Command,
      addRowBefore: () => Command,
      addRowAfter: () => Command,
      deleteRow: () => Command,
      deleteTable: () => Command,
      mergeCells: () => Command,
      splitCell: () => Command,
      toggleHeaderColumn: () => Command,
      toggleHeaderRow: () => Command,
      toggleHeaderCell: () => Command,
      mergeOrSplit: () => Command,
      setCellAttribute: (name: string, value: any) => Command,
      goToNextCell: () => Command,
      goToPreviousCell: () => Command,
      fixTables: () => Command,
    }
  }

  interface NodeConfig<Options> {
    /**
     * Table Role
     */
    tableRole?: string | ((this: { options: Options }) => string),
  }
}

export const Table = Node.create<TableOptions>({
  name: 'table',

  defaultOptions: {
    HTMLAttributes: {},
    resizable: false,
    handleWidth: 5,
    cellMinWidth: 25,
    // TODO: fix
    // @ts-ignore
    View: TableView,
    lastColumnResizable: true,
    allowTableNodeSelection: false,
  },

  content: 'tableRow+',

  tableRole: 'table',

  isolating: true,

  group: 'block',

  parseHTML() {
    return [
      { tag: 'table' },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['table', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), ['tbody', 0]]
  },

  addCommands() {
    return {
      insertTable: ({ rows = 3, cols = 3, withHeaderRow = true } = {}) => ({ tr, dispatch, editor }) => {
        const node = createTable(editor.schema, rows, cols, withHeaderRow)

        if (dispatch) {
          const offset = tr.selection.anchor + 1

          tr.replaceSelectionWith(node)
            .scrollIntoView()
            .setSelection(TextSelection.near(tr.doc.resolve(offset)))
        }

        return true
      },
      addColumnBefore: () => ({ state, dispatch }) => {
        return addColumnBefore(state, dispatch)
      },
      addColumnAfter: () => ({ state, dispatch }) => {
        return addColumnAfter(state, dispatch)
      },
      deleteColumn: () => ({ state, dispatch }) => {
        return deleteColumn(state, dispatch)
      },
      addRowBefore: () => ({ state, dispatch }) => {
        return addRowBefore(state, dispatch)
      },
      addRowAfter: () => ({ state, dispatch }) => {
        return addRowAfter(state, dispatch)
      },
      deleteRow: () => ({ state, dispatch }) => {
        return deleteRow(state, dispatch)
      },
      deleteTable: () => ({ state, dispatch }) => {
        return deleteTable(state, dispatch)
      },
      mergeCells: () => ({ state, dispatch }) => {
        return mergeCells(state, dispatch)
      },
      splitCell: () => ({ state, dispatch }) => {
        return splitCell(state, dispatch)
      },
      toggleHeaderColumn: () => ({ state, dispatch }) => {
        return toggleHeaderColumn(state, dispatch)
      },
      toggleHeaderRow: () => ({ state, dispatch }) => {
        return toggleHeaderRow(state, dispatch)
      },
      toggleHeaderCell: () => ({ state, dispatch }) => {
        return toggleHeaderCell(state, dispatch)
      },
      mergeOrSplit: () => ({ state, dispatch }) => {
        if (mergeCells(state, dispatch)) {
          return true
        }

        return splitCell(state, dispatch)
      },
      setCellAttribute: (name, value) => ({ state, dispatch }) => {
        return setCellAttr(name, value)(state, dispatch)
      },
      goToNextCell: () => ({ state, dispatch }) => {
        return goToNextCell(1)(state, dispatch)
      },
      goToPreviousCell: () => ({ state, dispatch }) => {
        return goToNextCell(-1)(state, dispatch)
      },
      fixTables: () => ({ state, dispatch }) => {
        if (dispatch) {
          fixTables(state)
        }

        return true
      },
    }
  },

  addKeyboardShortcuts() {
    const deleteTableWhenAllCellsSelected = () => {
      const { selection } = this.editor.state

      if (!isCellSelection(selection)) {
        return false
      }

      let cellCount = 0
      const table = findParentNodeClosestToPos(selection.ranges[0].$from, node => {
        return node.type.name === 'table'
      })

      table?.node.descendants(node => {
        if (node.type.name === 'table') {
          return false
        }

        if (['tableCell', 'tableHeader'].includes(node.type.name)) {
          cellCount += 1
        }
      })

      const allCellsSelected = cellCount === selection.ranges.length

      if (!allCellsSelected) {
        return false
      }

      this.editor.commands.deleteTable()

      return true
    }

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
      Backspace: deleteTableWhenAllCellsSelected,
      'Mod-Backspace': deleteTableWhenAllCellsSelected,
      Delete: deleteTableWhenAllCellsSelected,
      'Mod-Delete': deleteTableWhenAllCellsSelected,
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

  extendNodeSchema(extension) {
    const context = { options: extension.options }

    return {
      tableRole: callOrReturn(extension.config.tableRole, context),
    }
  },
})
