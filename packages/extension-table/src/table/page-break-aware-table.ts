import '../types.js'

import { mergeAttributes, Node } from '@tiptap/core'
import type { DOMOutputSpec, Node as ProseMirrorNode } from '@tiptap/pm/model'
import type { EditorState, Transaction } from '@tiptap/pm/state'
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
  toggleHeaderCell,
  toggleHeaderColumn,
  toggleHeaderRow,
} from '@tiptap/pm/tables'
import type { NodeView } from '@tiptap/pm/view'

import { PageBreakAwareTableView } from './PageBreakAwareTableView.js'
import { createColGroup } from './utilities/createColGroup.js'

export interface PageBreakAwareTableOptions {
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
   * @default PageBreakAwareTableView
   */
  View: (new (node: ProseMirrorNode, cellMinWidth: number, enablePageBreaks: boolean) => NodeView) | null

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

  /**
   * Enable page break functionality.
   * @default true
   * @example false
   */
  enablePageBreaks: boolean
}

/**
 * Enhanced table extension with page break support for cells.
 * This extension allows table cell content to flow across multiple pages
 * similar to Google Docs, preventing tables from breaking when cell content
 * exceeds the page height.
 */
export const PageBreakAwareTable = Node.create<PageBreakAwareTableOptions>({
  name: 'pageBreakAwareTable',

  addOptions() {
    return {
      HTMLAttributes: {},
      resizable: false,
      handleWidth: 5,
      cellMinWidth: 25,
      View: PageBreakAwareTableView,
      lastColumnResizable: true,
      allowTableNodeSelection: false,
      enablePageBreaks: true,
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
    const { colgroup, tableWidth, tableMinWidth } = createColGroup(node, this.options.cellMinWidth)

    const tableAttrs = mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
      style: tableWidth ? `width: ${tableWidth}` : `min-width: ${tableMinWidth}`,
    })

    // Add page break aware classes if enabled
    if (this.options.enablePageBreaks) {
      const classes = ['page-break-aware-table']
      tableAttrs.class = [tableAttrs.class, ...classes].filter(Boolean).join(' ')
    }

    const table: DOMOutputSpec = ['table', tableAttrs, colgroup, ['tbody', 0]]

    return table
  },

  addCommands() {
    return {
      insertTable:
        () =>
        ({ tr, dispatch }: { tr: Transaction; dispatch?: (tr: Transaction) => void }) => {
          const node = this.type.schema.nodes.pageBreakAwareTable.create()

          if (dispatch) {
            const offset = tr.selection.anchor + 1

            tr.replaceSelectionWith(node)
              .scrollIntoView()
              .setSelection(TextSelection.near(tr.doc.resolve(offset)))
          }

          return true
        },
      addColumnBefore:
        () =>
        ({ state, dispatch }: { state: EditorState; dispatch?: (tr: Transaction) => void }) => {
          return addColumnBefore(state, dispatch)
        },
      addColumnAfter:
        () =>
        ({ state, dispatch }: { state: EditorState; dispatch?: (tr: Transaction) => void }) => {
          return addColumnAfter(state, dispatch)
        },
      deleteColumn:
        () =>
        ({ state, dispatch }: { state: EditorState; dispatch?: (tr: Transaction) => void }) => {
          return deleteColumn(state, dispatch)
        },
      addRowBefore:
        () =>
        ({ state, dispatch }: { state: EditorState; dispatch?: (tr: Transaction) => void }) => {
          return addRowBefore(state, dispatch)
        },
      addRowAfter:
        () =>
        ({ state, dispatch }: { state: EditorState; dispatch?: (tr: Transaction) => void }) => {
          return addRowAfter(state, dispatch)
        },
      deleteRow:
        () =>
        ({ state, dispatch }: { state: EditorState; dispatch?: (tr: Transaction) => void }) => {
          return deleteRow(state, dispatch)
        },
      deleteTable:
        () =>
        ({ state, dispatch }: { state: EditorState; dispatch?: (tr: Transaction) => void }) => {
          return deleteTable(state, dispatch)
        },
      mergeCells:
        () =>
        ({ state, dispatch }: { state: EditorState; dispatch?: (tr: Transaction) => void }) => {
          return mergeCells(state, dispatch)
        },
      splitCell:
        () =>
        ({ state, dispatch }: { state: EditorState; dispatch?: (tr: Transaction) => void }) => {
          return splitCell(state, dispatch)
        },
      toggleHeaderColumn:
        () =>
        ({ state, dispatch }: { state: EditorState; dispatch?: (tr: Transaction) => void }) => {
          return toggleHeaderColumn(state, dispatch)
        },
      toggleHeaderRow:
        () =>
        ({ state, dispatch }: { state: EditorState; dispatch?: (tr: Transaction) => void }) => {
          return toggleHeaderRow(state, dispatch)
        },
      toggleHeaderCell:
        () =>
        ({ state, dispatch }: { state: EditorState; dispatch?: (tr: Transaction) => void }) => {
          return toggleHeaderCell(state, dispatch)
        },
      mergeOrSplit:
        () =>
        ({ state, dispatch }: { state: EditorState; dispatch?: (tr: Transaction) => void }) => {
          if (mergeCells(state, dispatch)) {
            return true
          }

          return splitCell(state, dispatch)
        },
      setCellAttribute:
        (name: string, value: any) =>
        ({ state, dispatch }: { state: EditorState; dispatch?: (tr: Transaction) => void }) => {
          return setCellAttr(name, value)(state, dispatch)
        },
      goToNextCell:
        () =>
        ({ state, dispatch }: { state: EditorState; dispatch?: (tr: Transaction) => void }) => {
          return goToNextCell(1)(state, dispatch)
        },
      goToPreviousCell:
        () =>
        ({ state, dispatch }: { state: EditorState; dispatch?: (tr: Transaction) => void }) => {
          return goToNextCell(-1)(state, dispatch)
        },
      fixTables:
        () =>
        ({ state, dispatch }: { state: EditorState; dispatch?: (tr: Transaction) => void }) => {
          if (dispatch) {
            fixTables(state)
          }

          return true
        },
      setCellSelection:
        (position: { anchorCell: number; headCell?: number }) =>
        ({ tr, dispatch }: { tr: Transaction; dispatch?: (tr: Transaction) => void }) => {
          if (dispatch) {
            const selection = CellSelection.create(tr.doc, position.anchorCell, position.headCell)

            tr.setSelection(selection)
          }

          return true
        },
      /**
       * Set page break behavior for selected table cells
       */
      setCellPageBreak:
        (options: {
          before?: 'auto' | 'always' | 'avoid' | 'left' | 'right'
          after?: 'auto' | 'always' | 'avoid' | 'left' | 'right'
          inside?: 'auto' | 'avoid'
        }) =>
        ({ state, dispatch }: { state: EditorState; dispatch?: (tr: Transaction) => void }) => {
          const { selection } = state

          if (!(selection instanceof CellSelection)) {
            return false
          }

          if (dispatch) {
            // Apply page break settings to all selected cells
            selection.forEachCell((cell: ProseMirrorNode, cellPos: number) => {
              const attrs = { ...cell.attrs }

              if (options.before) {attrs.pageBreakBefore = options.before}
              if (options.after) {attrs.pageBreakAfter = options.after}
              if (options.inside) {attrs.pageBreakInside = options.inside}

              const tr = state.tr.setNodeMarkup(cellPos, undefined, attrs)
              dispatch(tr)
            })
          }

          return true
        },
    }
  },

  addProseMirrorPlugins() {
    const plugins = [
      tableEditing({
        allowTableNodeSelection: this.options.allowTableNodeSelection,
      }),
    ]

    if (this.options.resizable && this.editor.isEditable) {
      plugins.push(
        columnResizing({
          handleWidth: this.options.handleWidth,
          cellMinWidth: this.options.cellMinWidth,
          lastColumnResizable: this.options.lastColumnResizable,
        } as any),
      )
    }

    return plugins
  },

  addNodeView() {
    return ({ node }) => {
      const { enablePageBreaks, cellMinWidth, View } = this.options

      if (!View) {
        return new PageBreakAwareTableView(node, cellMinWidth, enablePageBreaks)
      }

      return new View(node, cellMinWidth, enablePageBreaks)
    }
  },
})
