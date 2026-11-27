import type { Node as PMNode } from '@tiptap/pm/model'
import type { Transaction } from '@tiptap/pm/state'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { columnResizingPluginKey, TableMap } from '@tiptap/pm/tables'
import type { EditorView } from '@tiptap/pm/view'

import { applyColumnStyles } from './applyColumnStyles.js'
import { getColumnStyles } from './getColumnStyles.js'
import { getColumnWidths } from './getColumnWidths.js'
import { hasUserWidth } from './hasUserWidth.js'
import { resizeRelativeColumns } from './resizeRelativeColumns.js'

const relativeColumnResizingPluginKey = new PluginKey('relativeColumnResizing')

export interface RelativeColumnResizingOptions {
  /**
   * The narrowest a column may be dragged, in pixels.
   */
  cellMinWidth: number
}

/**
 * Resizes the columns of tables that have a relative width.
 *
 * prosemirror-tables' `columnResizing` starts a drag from the stored pixel width and renders
 * the table at the sum of its columns while dragging. In a relative table the stored widths
 * are proportions, so the table would jump. This plugin takes over the drag for those tables
 * and leaves every other table to `columnResizing`, whose resize handle it uses. Register it
 * before `columnResizing`.
 */
export function relativeColumnResizing({ cellMinWidth }: RelativeColumnResizingOptions): Plugin {
  return new Plugin({
    key: relativeColumnResizingPluginKey,
    props: {
      handleDOMEvents: {
        mousedown: (view, event) => startDrag(view, event, cellMinWidth),
      },
    },
  })
}

type DragTarget = {
  table: PMNode
  tablePos: number
  column: number
}

// The table and column of the resize handle `columnResizing` currently shows.
function findDragTarget(view: EditorView): DragTarget | null {
  const resizeState = columnResizingPluginKey.getState(view.state)

  if (!resizeState || resizeState.activeHandle < 0) {
    return null
  }

  const $cell = view.state.doc.resolve(resizeState.activeHandle)
  const cell = $cell.nodeAfter

  if (!cell) {
    return null
  }

  const table = $cell.node(-1)
  const tableStart = $cell.start(-1)
  const column = TableMap.get(table).colCount($cell.pos - tableStart) + cell.attrs.colspan - 1

  return { table, tablePos: tableStart - 1, column }
}

function findTableElement(view: EditorView, tablePos: number): HTMLTableElement | null {
  let dom: Node | null = view.domAtPos(tablePos + 1).node

  while (dom && dom.nodeName !== 'TABLE') {
    dom = dom.parentNode
  }

  return dom as HTMLTableElement | null
}

function getContentWidth(element: HTMLElement): number {
  const style = getComputedStyle(element)

  return element.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight)
}

function startDrag(view: EditorView, event: MouseEvent, cellMinWidth: number): boolean {
  const resizeState = columnResizingPluginKey.getState(view.state)

  if (!view.editable || !resizeState || resizeState.dragging) {
    return false
  }

  const target = findDragTarget(view)

  if (!target || !target.table.attrs.width || hasUserWidth(target.table)) {
    return false
  }

  const tableElement = findTableElement(view, target.tablePos)
  const colgroup = tableElement?.querySelector('colgroup')
  const containerWidth = tableElement?.parentElement
    ? getContentWidth(tableElement.parentElement)
    : 0

  if (!tableElement || !colgroup || !containerWidth) {
    return false
  }

  // Start from the rendered widths, so the stored proportions become pixels again
  // and the column follows the pointer.
  const stored = getColumnWidths(target.table).map(width => width || cellMinWidth)
  const scale = tableElement.offsetWidth / stored.reduce((total, width) => total + width, 0)
  const widths = stored.map(width => width * scale)
  const startX = event.clientX

  const resize = (pointer: MouseEvent) =>
    resizeRelativeColumns({
      widths,
      column: target.column,
      delta: pointer.clientX - startX,
      minWidth: cellMinWidth,
      width: target.table.attrs.width,
      containerWidth,
    })

  const win = view.dom.ownerDocument.defaultView ?? window

  const move = (pointer: MouseEvent) => {
    if (!pointer.buttons) {
      finish(pointer)

      return
    }

    const result = resize(pointer)

    applyColumnStyles(
      colgroup as HTMLTableColElement,
      tableElement,
      getColumnStyles(result.widths, cellMinWidth, result.width),
      false,
    )
  }

  const finish = (pointer: MouseEvent) => {
    win.removeEventListener('mouseup', finish)
    win.removeEventListener('mousemove', move)

    const tr = view.state.tr.setMeta(columnResizingPluginKey, { setDragging: null })
    const current = findDragTarget(view)

    if (pointer.clientX !== startX && current) {
      writeWidths(tr, current, resize(pointer))
    }

    view.dispatch(tr)
  }

  view.dispatch(
    view.state.tr.setMeta(columnResizingPluginKey, {
      setDragging: { startX, startWidth: widths[target.column] },
    }),
  )

  win.addEventListener('mouseup', finish)
  win.addEventListener('mousemove', move)
  event.preventDefault()

  return true
}

function writeWidths(
  tr: Transaction,
  { table, tablePos }: DragTarget,
  { widths, width }: { widths: number[]; width: number },
) {
  const map = TableMap.get(table)

  // The table may have changed during the drag, through collaboration for example.
  if (map.width !== widths.length) {
    return
  }

  new Set(map.map).forEach(cellPos => {
    const cell = table.nodeAt(cellPos)

    if (!cell) {
      return
    }

    const { left, right } = map.findCell(cellPos)
    const colwidth = widths.slice(left, right).map(Math.round)

    tr.setNodeMarkup(tablePos + 1 + cellPos, null, { ...cell.attrs, colwidth })
  })

  if (width !== table.attrs.width) {
    tr.setNodeAttribute(tablePos, 'width', width)
  }
}
