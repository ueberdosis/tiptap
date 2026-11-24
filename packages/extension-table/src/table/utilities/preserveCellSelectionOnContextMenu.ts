import { Plugin, PluginKey } from '@tiptap/pm/state'
import type { CellSelection } from '@tiptap/pm/tables'
import type { EditorView } from '@tiptap/pm/view'

import { isCellSelection } from './isCellSelection.js'

const preserveCellSelectionOnContextMenuPluginKey = new PluginKey(
  'preserveCellSelectionOnContextMenu',
)

function resolveClickPos(view: EditorView, event: MouseEvent): number | null {
  const coords = view.posAtCoords({ left: event.clientX, top: event.clientY })

  if (coords) {
    return coords.pos
  }

  if (!(event.target instanceof Node)) {
    return null
  }

  try {
    return view.posAtDOM(event.target, 0)
  } catch {
    return null
  }
}

function isPosInsideCellSelection(selection: CellSelection, pos: number): boolean {
  let inside = false

  selection.forEachCell((cell, cellPos) => {
    if (pos >= cellPos && pos < cellPos + cell.nodeSize) {
      inside = true
    }
  })

  return inside
}

export function preserveCellSelectionOnContextMenu() {
  return new Plugin({
    key: preserveCellSelectionOnContextMenuPluginKey,
    props: {
      handleDOMEvents: {
        mousedown(view, event) {
          if (event.button !== 2) {
            return false
          }

          const { selection } = view.state

          if (!isCellSelection(selection) || selection.ranges.length < 2) {
            return false
          }

          const clickPos = resolveClickPos(view, event)

          if (clickPos == null || !isPosInsideCellSelection(selection, clickPos)) {
            return false
          }

          event.preventDefault()
          return true
        },
      },
    },
  })
}
