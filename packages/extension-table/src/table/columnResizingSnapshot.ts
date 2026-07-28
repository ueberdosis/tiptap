import { Plugin } from '@tiptap/pm/state'
import { columnResizingPluginKey, TableMap } from '@tiptap/pm/tables'
import type { EditorView } from '@tiptap/pm/view'

function findTableElement(view: EditorView, tableStart: number) {
  let dom: Node | null = view.domAtPos(tableStart).node

  while (dom && dom.nodeName !== 'TABLE') {
    dom = dom.parentNode
  }

  return dom instanceof HTMLTableElement ? dom : null
}

function readRenderedColumnWidths(view: EditorView, tableStart: number, columnCount: number) {
  const tableElement = findTableElement(view, tableStart)

  if (!tableElement) {
    return null
  }

  const columns = tableElement.querySelectorAll<HTMLTableColElement>(':scope > colgroup > col')

  if (columns.length !== columnCount) {
    return null
  }

  const widths = Array.from(columns, col => Math.round(col.getBoundingClientRect().width))

  if (widths.some(width => width <= 0)) {
    return null
  }

  return widths
}

function snapshotColumnWidths(view: EditorView, cellPos: number) {
  const $cell = view.state.doc.resolve(cellPos)
  const table = $cell.node(-1)
  const tableStart = $cell.start(-1)
  const map = TableMap.get(table)
  const cellPositions = [...new Set(map.map)]

  const needsSnapshot = cellPositions.some(pos => {
    const cell = table.nodeAt(pos)
    const colwidth = cell?.attrs.colwidth as number[] | null

    return !colwidth || colwidth.length !== cell?.attrs.colspan || colwidth.some(width => !width)
  })

  if (!needsSnapshot) {
    return
  }

  const widths = readRenderedColumnWidths(view, tableStart, map.width)

  if (!widths) {
    return
  }

  const tr = view.state.tr

  cellPositions.forEach(pos => {
    const cell = table.nodeAt(pos)

    if (!cell) {
      return
    }

    const column = map.colCount(pos)
    const colwidth = widths.slice(column, column + cell.attrs.colspan)

    tr.setNodeMarkup(tableStart + pos, null, { ...cell.attrs, colwidth })
  })

  if (tr.docChanged) {
    tr.setMeta('addToHistory', false)
    view.dispatch(tr)
  }
}

export function columnResizingSnapshot() {
  return new Plugin({
    props: {
      handleDOMEvents: {
        mousedown(view) {
          const resizeState = columnResizingPluginKey.getState(view.state)

          if (resizeState && resizeState.activeHandle > -1 && !resizeState.dragging) {
            snapshotColumnWidths(view, resizeState.activeHandle)
          }

          return false
        },
      },
    },
  })
}
