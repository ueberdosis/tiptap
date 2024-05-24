import {
  callOrReturn, getExtensionField, mergeAttributes, Node, ParentConfig,
} from '@tiptap/core'
import { DOMOutputSpec } from '@tiptap/pm/model'
import { TextSelection } from '@tiptap/pm/state'
import {
  addColumnAfter,
  addColumnBefore,
  addRowAfter,
  addRowBefore,
  CellSelection,
  columnResizing,
  deleteColumn,
  deleteRow,
  deleteTable,
  fixTables,
  goToNextCell,
  mergeCells,
  setCellAttr,
  splitCell,
  tableEditing,
  toggleHeader,
  toggleHeaderCell,
} from '@tiptap/pm/tables'
import { NodeView } from '@tiptap/pm/view'

import { TableView } from './TableView.js'
import { createColGroup } from './utilities/createColGroup.js'
import { createTable } from './utilities/createTable.js'
import { deleteTableWhenAllCellsSelected } from './utilities/deleteTableWhenAllCellsSelected.js'

export interface TableOptions {
  /**
   * HTML attributes for the table element.
   * @default {}
   * @example { class: 'foo' }
   */
  HTMLAttributes: Record<string, any>

  /**
   * Enables the resizing of tables.
   * @default false
   * @example true
   */
  resizable: boolean

  /**
   * The width of the resize handle.
   * @default 5
   * @example 10
   */
  handleWidth: number

  /**
   * The minimum width of a cell.
   * @default 25
   * @example 50
   */
  cellMinWidth: number

  /**
   * The node view to render the table.
   * @default TableView
   */
  View: NodeView

  /**
   * Enables the resizing of the last column.
   * @default true
   * @example false
   */
  lastColumnResizable: boolean

  /**
   * Allow table node selection.
   * @default false
   * @example true
   */
  allowTableNodeSelection: boolean
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    table: {
      /**
       * Insert a table
       * @param options The table attributes
       * @returns True if the command was successful, otherwise false
       * @example editor.commands.insertTable({ rows: 3, cols: 3, withHeaderRow: true })
       */
      insertTable: (options?: {
        rows?: number
        cols?: number
        withHeaderRow?: boolean
      }) => ReturnType

      /**
       * Add a column before the current column
       * @returns True if the command was successful, otherwise false
       * @example editor.commands.addColumnBefore()
      */
      addColumnBefore: () => ReturnType

      /**
       * Add a column after the current column
       * @returns True if the command was successful, otherwise false
       * @example editor.commands.addColumnAfter()
       */
      addColumnAfter: () => ReturnType

      /**
       * Delete the current column
       * @returns True if the command was successful, otherwise false
       * @example editor.commands.deleteColumn()
       */
      deleteColumn: () => ReturnType

      /**
       * Add a row before the current row
       * @returns True if the command was successful, otherwise false
       * @example editor.commands.addRowBefore()
       */
      addRowBefore: () => ReturnType

      /**
       * Add a row after the current row
       * @returns True if the command was successful, otherwise false
       * @example editor.commands.addRowAfter()
       */
      addRowAfter: () => ReturnType

      /**
       * Delete the current row
       * @returns True if the command was successful, otherwise false
       * @example editor.commands.deleteRow()
       */
      deleteRow: () => ReturnType

      /**
       * Delete the current table
       * @returns True if the command was successful, otherwise false
       * @example editor.commands.deleteTable()
       */
      deleteTable: () => ReturnType

      /**
       * Merge the currently selected cells
       * @returns True if the command was successful, otherwise false
       * @example editor.commands.mergeCells()
       */
      mergeCells: () => ReturnType

      /**
       * Split the currently selected cell
       * @returns True if the command was successful, otherwise false
       * @example editor.commands.splitCell()
       */
      splitCell: () => ReturnType

      /**
       * Toggle the header column
       * @returns True if the command was successful, otherwise false
       * @example editor.commands.toggleHeaderColumn()
       */
      toggleHeaderColumn: () => ReturnType

      /**
       * Toggle the header row
       * @returns True if the command was successful, otherwise false
       * @example editor.commands.toggleHeaderRow()
       */
      toggleHeaderRow: () => ReturnType

      /**
       * Toggle the header cell
       * @returns True if the command was successful, otherwise false
       * @example editor.commands.toggleHeaderCell()
       */
      toggleHeaderCell: () => ReturnType

      /**
       * Merge or split the currently selected cells
       * @returns True if the command was successful, otherwise false
       * @example editor.commands.mergeOrSplit()
       */
      mergeOrSplit: () => ReturnType

      /**
       * Set a cell attribute
       * @param name The attribute name
       * @param value The attribute value
       * @returns True if the command was successful, otherwise false
       * @example editor.commands.setCellAttribute('align', 'right')
       */
      setCellAttribute: (name: string, value: any) => ReturnType

      /**
       * Moves the selection to the next cell
       * @returns True if the command was successful, otherwise false
       * @example editor.commands.goToNextCell()
       */
      goToNextCell: () => ReturnType

      /**
       * Moves the selection to the previous cell
       * @returns True if the command was successful, otherwise false
       * @example editor.commands.goToPreviousCell()
       */
      goToPreviousCell: () => ReturnType

      /**
       * Try to fix the table structure if necessary
       * @returns True if the command was successful, otherwise false
       * @example editor.commands.fixTables()
       */
      fixTables: () => ReturnType

      /**
       * Set a cell selection inside the current table
       * @param position The cell position
       * @returns True if the command was successful, otherwise false
       * @example editor.commands.setCellSelection({ anchorCell: 1, headCell: 2 })
       */
      setCellSelection: (position: { anchorCell: number; headCell?: number }) => ReturnType
    }
  }

  interface NodeConfig<Options, Storage> {
    /**
     * A string or function to determine the role of the table.
     * @default 'table'
     * @example () => 'table'
     */
    tableRole?:
      | string
      | ((this: {
          name: string
          options: Options
          storage: Storage
          parent: ParentConfig<NodeConfig<Options>>['tableRole']
        }) => string)
  }
}

/**
 * This extension allows you to create tables.
 * @see https://www.tiptap.dev/api/nodes/table
 */
export const Table = Node.create<TableOptions>({
  name: 'table',

  // @ts-ignore
  addOptions() {
    return {
      HTMLAttributes: {},
      resizable: false,
      handleWidth: 5,
      cellMinWidth: 25,
      // TODO: fix
      View: TableView,
      lastColumnResizable: true,
      allowTableNodeSelection: false,
    }
  },

  content: 'tableRow+',

  tableRole: 'table',

  isolating: true,

  group: 'block',

  parseHTML() {
    return [{ tag: 'table' }]
  },

  renderHTML({ node, HTMLAttributes }) {
    const { colgroup, tableWidth, tableMinWidth } = createColGroup(
      node,
      this.options.cellMinWidth,
    )

    const table: DOMOutputSpec = [
      'table',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        style: tableWidth
          ? `width: ${tableWidth}`
          : `minWidth: ${tableMinWidth}`,
      }),
      colgroup,
      ['tbody', 0],
    ]

    return table
  },

  addCommands() {
    return {
      insertTable:
        ({ rows = 3, cols = 3, withHeaderRow = true } = {}) => ({ tr, dispatch, editor }) => {
          const node = createTable(editor.schema, rows, cols, withHeaderRow)

          if (dispatch) {
            const offset = tr.selection.anchor + 1

            tr.replaceSelectionWith(node)
              .scrollIntoView()
              .setSelection(TextSelection.near(tr.doc.resolve(offset)))
          }

          return true
        },
      addColumnBefore:
        () => ({ state, dispatch }) => {
          return addColumnBefore(state, dispatch)
        },
      addColumnAfter:
        () => ({ state, dispatch }) => {
          return addColumnAfter(state, dispatch)
        },
      deleteColumn:
        () => ({ state, dispatch }) => {
          return deleteColumn(state, dispatch)
        },
      addRowBefore:
        () => ({ state, dispatch }) => {
          return addRowBefore(state, dispatch)
        },
      addRowAfter:
        () => ({ state, dispatch }) => {
          return addRowAfter(state, dispatch)
        },
      deleteRow:
        () => ({ state, dispatch }) => {
          return deleteRow(state, dispatch)
        },
      deleteTable:
        () => ({ state, dispatch }) => {
          return deleteTable(state, dispatch)
        },
      mergeCells:
        () => ({ state, dispatch }) => {
          return mergeCells(state, dispatch)
        },
      splitCell:
        () => ({ state, dispatch }) => {
          return splitCell(state, dispatch)
        },
      toggleHeaderColumn:
        () => ({ state, dispatch }) => {
          return toggleHeader('column')(state, dispatch)
        },
      toggleHeaderRow:
        () => ({ state, dispatch }) => {
          return toggleHeader('row')(state, dispatch)
        },
      toggleHeaderCell:
        () => ({ state, dispatch }) => {
          return toggleHeaderCell(state, dispatch)
        },
      mergeOrSplit:
        () => ({ state, dispatch }) => {
          if (mergeCells(state, dispatch)) {
            return true
          }

          return splitCell(state, dispatch)
        },
      setCellAttribute:
        (name, value) => ({ state, dispatch }) => {
          return setCellAttr(name, value)(state, dispatch)
        },
      goToNextCell:
        () => ({ state, dispatch }) => {
          return goToNextCell(1)(state, dispatch)
        },
      goToPreviousCell:
        () => ({ state, dispatch }) => {
          return goToNextCell(-1)(state, dispatch)
        },
      fixTables:
        () => ({ state, dispatch }) => {
          if (dispatch) {
            fixTables(state)
          }

          return true
        },
      setCellSelection:
        position => ({ tr, dispatch }) => {
          if (dispatch) {
            const selection = CellSelection.create(tr.doc, position.anchorCell, position.headCell)

            // @ts-ignore
            tr.setSelection(selection)
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

        return this.editor.chain().addRowAfter().goToNextCell().run()
      },
      'Shift-Tab': () => this.editor.commands.goToPreviousCell(),
      Backspace: deleteTableWhenAllCellsSelected,
      'Mod-Backspace': deleteTableWhenAllCellsSelected,
      Delete: deleteTableWhenAllCellsSelected,
      'Mod-Delete': deleteTableWhenAllCellsSelected,
    }
  },

  addProseMirrorPlugins() {
    const isResizable = this.options.resizable && this.editor.isEditable

    return [
      ...(isResizable
        ? [
          columnResizing({
            handleWidth: this.options.handleWidth,
            cellMinWidth: this.options.cellMinWidth,
            // @ts-ignore (incorrect type)
            View: this.options.View,
            // TODO: PR for @types/prosemirror-tables
            // @ts-ignore (incorrect type)
            lastColumnResizable: this.options.lastColumnResizable,
          }),
        ]
        : []),
      tableEditing({
        allowTableNodeSelection: this.options.allowTableNodeSelection,
      }),
    ]
  },

  extendNodeSchema(extension) {
    const context = {
      name: extension.name,
      options: extension.options,
      storage: extension.storage,
    }

    return {
      tableRole: callOrReturn(getExtensionField(extension, 'tableRole', context)),
    }
  },
})
