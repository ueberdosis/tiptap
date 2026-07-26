import '../types.js'

import {
  type JSONContent,
  type MarkdownToken,
  callOrReturn,
  getExtensionField,
  mergeAttributes,
  Node,
} from '@tiptap/core'
import type { DOMOutputSpec, Node as ProseMirrorNode } from '@tiptap/pm/model'
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
import type { EditorView, NodeView } from '@tiptap/pm/view'

import { type TableCellAlign, normalizeTableCellAlign } from '../utils/parseAlign.js'
import { TableView } from './TableView.js'
import { createColGroup } from './utilities/createColGroup.js'
import { createTable } from './utilities/createTable.js'
import { deleteTableWhenAllCellsSelected } from './utilities/deleteTableWhenAllCellsSelected.js'
import renderTableToMarkdown, { preprocessTablePipes } from './utilities/markdown.js'

type MarkdownTableToken = {
  align?: Array<TableCellAlign | null>
  header?: { tokens: MarkdownToken[]; align?: TableCellAlign | null }[]
  rows?: { tokens: MarkdownToken[]; align?: TableCellAlign | null }[][]
} & MarkdownToken

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
   * Controls whether the table should be wrapped in a div with class "tableWrapper" when rendered.
   * In editable mode with resizable tables, this wrapper is always present via TableView.
   * @default false
   * @example true
   */
  renderWrapper: boolean

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
  View:
    | (new (
        node: ProseMirrorNode,
        cellMinWidth: number,
        view: EditorView,
        HTMLAttributes?: Record<string, any>,
      ) => NodeView)
    | null

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
      renderWrapper: false,
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
    const { colgroup, tableWidth, tableMinWidth } = createColGroup(node, this.options.cellMinWidth)

    const userStyles = HTMLAttributes.style as string | undefined

    function getTableStyle() {
      if (userStyles) {
        return userStyles
      }

      return tableWidth ? `width: ${tableWidth}` : `min-width: ${tableMinWidth}`
    }

    const table: DOMOutputSpec = [
      'table',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        style: getTableStyle(),
      }),
      colgroup,
      ['tbody', 0],
    ]

    return this.options.renderWrapper ? ['div', { class: 'tableWrapper' }, table] : table
  },

  parseMarkdown: (token: MarkdownTableToken, h) => {
    const rows = []
    const alignments = Array.isArray(token.align) ? token.align : []

    if (token.header) {
      const headerCells: JSONContent[] = []

      token.header.forEach((cell, index) => {
        const align = normalizeTableCellAlign(alignments[index] ?? cell.align)
        const attrs = align ? { align } : {}

        headerCells.push(
          h.createNode('tableHeader', attrs, [
            { type: 'paragraph', content: h.parseInline(cell.tokens) },
          ]),
        )
      })

      rows.push(h.createNode('tableRow', {}, headerCells))
    }

    if (token.rows) {
      token.rows.forEach(row => {
        const bodyCells: JSONContent[] = []
        row.forEach((cell, index) => {
          const align = normalizeTableCellAlign(alignments[index] ?? cell.align)
          const attrs = align ? { align } : {}

          bodyCells.push(
            h.createNode('tableCell', attrs, [
              { type: 'paragraph', content: h.parseInline(cell.tokens) },
            ]),
          )
        })
        rows.push(h.createNode('tableRow', {}, bodyCells))
      })
    }

    return h.createNode('table', undefined, rows)
  },

  renderMarkdown: (node, h) => {
    return renderTableToMarkdown(node, h)
  },

  markdownTokenizer: {
    name: 'table',
    level: 'block' as const,
    start: (src: string) => {
      const lines = src.split('\n')
      if (lines.length < 2) return -1
      const sep = lines[1]
      if (!/^[ \t|:]*-[ \t|:-]*$/.test(sep) || !sep.includes('|')) return -1
      return lines[0].includes('|') ? 0 : -1
    },
    tokenize(src, _tokens, helper) {
      // Marked terminates a table block at a blank line. Slicing to the first
      // \n\n keeps helper.blockTokens isolated to the candidate table so it
      // cannot consume content that follows. When no blank line exists the
      // full remaining source is used and marked's own table regex determines
      // the boundary (it excludes headings, fences, blockquotes, etc.).
      const blankLineIndex = src.indexOf('\n\n')
      const candidate = blankLineIndex >= 0 ? src.slice(0, blankLineIndex) : src

      // A GFM table needs at least a header and a separator row (two lines).
      const candidateLines = candidate.split('\n')
      if (candidateLines.length < 2) return undefined

      // Guard: the second line must match a GFM delimiter row (dashes, colons,
      // pipes, spaces) AND must contain at least one '|'. A bare '---' matches
      // the dash pattern but is a setext heading marker, not a table separator.
      // Calling helper.blockTokens on non-table content contaminates the outer
      // lexer's inline queue with preprocessed (backslash-modified) content.
      const sep = candidateLines[1]
      if (!/^[ \t|:]*-[ \t|:-]*$/.test(sep) || !sep.includes('|')) return undefined

      const preprocessed = preprocessTablePipes(candidate)

      // Nothing to fix — let marked's built-in handle it.
      if (preprocessed === candidate) return undefined

      // Re-lex only the preprocessed candidate. The recursive call to our
      // tokenizer finds no unescaped pipes left inside code spans and returns
      // undefined, so marked's built-in table tokenizer produces
      // correctly-split cells.
      const block = helper.blockTokens(preprocessed)
      const tableToken = block[0]
      if (tableToken?.type !== 'table' || !tableToken.raw) return undefined

      // preprocessTablePipes only inserts backslashes (never adds or removes
      // newlines), so line N in preprocessed maps 1-to-1 to line N in src.
      // Use the token's line count to reconstruct raw from the original src so
      // marked advances its cursor by the correct amount.
      const lineCount = tableToken.raw.split('\n').length
      const raw = src.split('\n').slice(0, lineCount).join('\n')

      return { ...tableToken, raw }
    },
  },

  addCommands() {
    return {
      insertTable:
        ({ rows = 3, cols = 3, withHeaderRow = true } = {}) =>
        ({ tr, dispatch, editor }) => {
          const node = createTable(editor.schema, rows, cols, withHeaderRow)

          if (dispatch) {
            const offset = tr.selection.from + 1

            tr.replaceSelectionWith(node)
              .scrollIntoView()
              .setSelection(TextSelection.near(tr.doc.resolve(offset)))
          }

          return true
        },
      addColumnBefore:
        () =>
        ({ state, dispatch }) => {
          return addColumnBefore(state, dispatch)
        },
      addColumnAfter:
        () =>
        ({ state, dispatch }) => {
          return addColumnAfter(state, dispatch)
        },
      deleteColumn:
        () =>
        ({ state, dispatch }) => {
          return deleteColumn(state, dispatch)
        },
      addRowBefore:
        () =>
        ({ state, dispatch }) => {
          return addRowBefore(state, dispatch)
        },
      addRowAfter:
        () =>
        ({ state, dispatch }) => {
          return addRowAfter(state, dispatch)
        },
      deleteRow:
        () =>
        ({ state, dispatch }) => {
          return deleteRow(state, dispatch)
        },
      deleteTable:
        () =>
        ({ state, dispatch }) => {
          return deleteTable(state, dispatch)
        },
      mergeCells:
        () =>
        ({ state, dispatch }) => {
          return mergeCells(state, dispatch)
        },
      splitCell:
        () =>
        ({ state, dispatch }) => {
          return splitCell(state, dispatch)
        },
      toggleHeaderColumn:
        () =>
        ({ state, dispatch }) => {
          return toggleHeader('column')(state, dispatch)
        },
      toggleHeaderRow:
        () =>
        ({ state, dispatch }) => {
          return toggleHeader('row')(state, dispatch)
        },
      toggleHeaderCell:
        () =>
        ({ state, dispatch }) => {
          return toggleHeaderCell(state, dispatch)
        },
      mergeOrSplit:
        () =>
        ({ state, dispatch }) => {
          if (mergeCells(state, dispatch)) {
            return true
          }

          return splitCell(state, dispatch)
        },
      setCellAttribute:
        (name, value) =>
        ({ state, dispatch }) => {
          return setCellAttr(name, value)(state, dispatch)
        },
      goToNextCell:
        () =>
        ({ state, dispatch }) => {
          return goToNextCell(1)(state, dispatch)
        },
      goToPreviousCell:
        () =>
        ({ state, dispatch }) => {
          return goToNextCell(-1)(state, dispatch)
        },
      fixTables:
        () =>
        ({ state, dispatch }) => {
          if (dispatch) {
            fixTables(state)
          }

          return true
        },
      setCellSelection:
        position =>
        ({ tr, dispatch }) => {
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
              defaultCellMinWidth: this.options.cellMinWidth,
              View: this.options.View,
              lastColumnResizable: this.options.lastColumnResizable,
            }),
          ]
        : []),
      tableEditing({
        allowTableNodeSelection: this.options.allowTableNodeSelection,
      }),
    ]
  },

  addNodeView() {
    // When resizable, the columnResizing plugin registers its own NodeView.
    // We only register one here for the non-resizable case so that
    // <colgroup> stays in sync with column changes (issue #7015).
    const isResizable = this.options.resizable && this.editor.isEditable
    const View = this.options.View

    if (isResizable || !View) {
      return null
    }

    return ({ node, view, HTMLAttributes }) => {
      const mergedAttributes = mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)

      return new View(node, this.options.cellMinWidth, view, mergedAttributes) as NodeView
    }
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
