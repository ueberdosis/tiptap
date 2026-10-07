// @vitest-environment happy-dom

import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { CellSelection } from '@tiptap/pm/tables'
import { afterEach, describe, expect, it } from 'vite-plus/test'

import { TableCell } from '../../cell/table-cell.js'
import { TableHeader } from '../../header/table-header.js'
import { TableRow } from '../../row/table-row.js'
import { Table } from '../table.js'

const collectCellPositions = (editor: Editor): number[] => {
  const positions: number[] = []

  editor.state.doc.descendants((node, pos) => {
    if (node.type.name === 'tableCell' || node.type.name === 'tableHeader') {
      positions.push(pos)
    }
  })

  return positions
}

const createTableEditor = (content: string) => {
  const element = document.createElement('div')
  document.body.appendChild(element)

  return new Editor({
    element,
    extensions: [Document, Paragraph, Text, Table, TableRow, TableHeader, TableCell],
    content,
  })
}

const dispatchMouseDown = (editor: Editor, cell: Element, button: number, clickPos: number) => {
  editor.view.posAtCoords = () => ({ pos: clickPos, inside: clickPos })

  const event = new MouseEvent('mousedown', {
    button,
    bubbles: true,
    cancelable: true,
    clientX: 10,
    clientY: 10,
  })

  cell.dispatchEvent(event)
  return event
}

describe('preserveCellSelectionOnContextMenu', () => {
  let editor: Editor

  afterEach(() => {
    editor?.destroy()
  })

  it('keeps a multi-cell CellSelection when right-clicking a non-anchor cell', () => {
    editor = createTableEditor(
      '<table><tbody><tr><td>A1</td><td>B1</td><td>C1</td></tr><tr><td>A2</td><td>B2</td><td>C2</td></tr></tbody></table>',
    )

    const cells = collectCellPositions(editor)
    editor.chain().focus().setCellSelection({ anchorCell: cells[1], headCell: cells[0] }).run()

    const selectionBefore = editor.state.selection
    expect(selectionBefore).toBeInstanceOf(CellSelection)
    expect(selectionBefore.ranges).toHaveLength(2)

    const event = dispatchMouseDown(
      editor,
      editor.view.dom.querySelectorAll('td')[0],
      2,
      cells[0] + 1,
    )

    expect(event.defaultPrevented).toBe(true)
    expect(editor.state.selection).toBeInstanceOf(CellSelection)
    expect(editor.state.selection.ranges).toHaveLength(2)
    expect(editor.state.selection.eq(selectionBefore)).toBe(true)
  })

  it('does not intercept left-clicks, so the selection can still change', () => {
    editor = createTableEditor(
      '<table><tbody><tr><td>A1</td><td>B1</td><td>C1</td></tr><tr><td>A2</td><td>B2</td><td>C2</td></tr></tbody></table>',
    )

    const cells = collectCellPositions(editor)
    editor.chain().focus().setCellSelection({ anchorCell: cells[0], headCell: cells[1] }).run()

    const event = dispatchMouseDown(
      editor,
      editor.view.dom.querySelectorAll('td')[0],
      0,
      cells[0] + 1,
    )

    expect(event.defaultPrevented).toBe(false)
    expect(editor.state.selection).toBeInstanceOf(CellSelection)

    editor
      .chain()
      .setTextSelection(cells[0] + 2)
      .run()

    expect(editor.state.selection).not.toBeInstanceOf(CellSelection)
  })

  it('does not preserve a CellSelection when right-clicking outside it', () => {
    editor = createTableEditor(
      '<table><tbody><tr><td>A1</td><td>B1</td><td>C1</td></tr><tr><td>A2</td><td>B2</td><td>C2</td></tr></tbody></table>',
    )

    const cells = collectCellPositions(editor)
    editor.chain().focus().setCellSelection({ anchorCell: cells[0], headCell: cells[1] }).run()

    const event = dispatchMouseDown(
      editor,
      editor.view.dom.querySelectorAll('td')[2],
      2,
      cells[2] + 1,
    )

    expect(event.defaultPrevented).toBe(false)
  })

  it('keeps a multi-cell CellSelection when right-clicking a table header', () => {
    editor = createTableEditor(
      '<table><tbody><tr><th>A</th><th>B</th><th>C</th></tr><tr><td>A2</td><td>B2</td><td>C2</td></tr></tbody></table>',
    )

    const cells = collectCellPositions(editor)
    editor.chain().focus().setCellSelection({ anchorCell: cells[1], headCell: cells[0] }).run()

    const event = dispatchMouseDown(
      editor,
      editor.view.dom.querySelectorAll('th')[0],
      2,
      cells[0] + 1,
    )

    expect(event.defaultPrevented).toBe(true)
    expect(editor.state.selection).toBeInstanceOf(CellSelection)
    expect(editor.state.selection.ranges).toHaveLength(2)
  })

  it('does not intercept right-clicks on a single-cell CellSelection', () => {
    editor = createTableEditor(
      '<table><tbody><tr><td>A1</td><td>B1</td><td>C1</td></tr><tr><td>A2</td><td>B2</td><td>C2</td></tr></tbody></table>',
    )

    const cells = collectCellPositions(editor)
    editor.chain().focus().setCellSelection({ anchorCell: cells[0], headCell: cells[0] }).run()

    const event = dispatchMouseDown(
      editor,
      editor.view.dom.querySelectorAll('td')[0],
      2,
      cells[0] + 1,
    )

    expect(event.defaultPrevented).toBe(false)
  })
})
