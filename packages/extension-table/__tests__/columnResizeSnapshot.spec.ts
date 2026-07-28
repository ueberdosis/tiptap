import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import { TableKit } from '@tiptap/extension-table'
import Text from '@tiptap/extension-text'
import { UndoRedo } from '@tiptap/extensions'
import { closeHistory } from '@tiptap/pm/history'
import type { Node as ProseMirrorNode } from '@tiptap/pm/model'
import { columnResizingPluginKey } from '@tiptap/pm/tables'
import { afterEach, describe, expect, it } from 'vitest'

describe('column resizing width snapshot', () => {
  const editorElClass = 'tiptap-column-resize-snapshot'
  let editor: Editor | null = null

  const getEditorEl = () => document.querySelector(`.${editorElClass}`)

  const createResizableEditor = () => {
    const element = document.createElement('div')
    element.classList.add(editorElClass)
    document.body.appendChild(element)

    return new Editor({
      element,
      extensions: [
        Document,
        Text,
        Paragraph,
        UndoRedo,
        TableKit.configure({ table: { resizable: true } }),
      ],
    })
  }

  const getTable = (): ProseMirrorNode | null => {
    let table: ProseMirrorNode | null = null

    editor?.state.doc.descendants(node => {
      if (node.type.spec.tableRole === 'table') {
        table = node
        return false
      }

      return true
    })

    return table
  }

  const getCellPositions = () => {
    const positions: number[] = []

    editor?.state.doc.descendants((node, pos) => {
      if (node.type.spec.tableRole === 'cell' || node.type.spec.tableRole === 'header_cell') {
        positions.push(pos)
      }
    })

    return positions
  }

  const getFirstRowWidths = () => {
    const row = getTable()?.firstChild

    return Array.from(
      { length: row?.childCount ?? 0 },
      (_, index) => row?.child(index).attrs.colwidth,
    )
  }

  const mockColWidths = (widths: number[]) => {
    const columns = editor!.view.dom.querySelectorAll<HTMLTableColElement>('colgroup > col')

    columns.forEach((column, index) => {
      column.getBoundingClientRect = () => new DOMRect(0, 0, widths[index], 0)
    })
  }

  const beginColumnResize = (cellPos: number, clientX = 0) => {
    editor!.view.dispatch(editor!.state.tr.setMeta(columnResizingPluginKey, { setHandle: cellPos }))

    const win = editor!.view.dom.ownerDocument.defaultView!

    editor!.view.dom.dispatchEvent(
      new MouseEvent('mousedown', { bubbles: true, button: 0, clientX }),
    )

    return win
  }

  const finishColumnResize = (win: Window, clientX: number) => {
    win.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, clientX }))
  }

  afterEach(() => {
    editor?.destroy()
    editor = null
    getEditorEl()?.remove()
  })

  it('preserves untouched widths when a non-leading column is resized first', () => {
    editor = createResizableEditor()
    editor.commands.insertTable({ rows: 2, cols: 3, withHeaderRow: true })
    editor.view.dispatch(closeHistory(editor.state.tr))

    const renderedWidths = [100, 120, 140]
    mockColWidths(renderedWidths)

    expect(getFirstRowWidths()).toEqual([null, null, null])

    const win = beginColumnResize(getCellPositions()[1])

    expect(getFirstRowWidths()).toEqual([[100], [120], [140]])

    finishColumnResize(win, 50)

    expect(getFirstRowWidths()).toEqual([[100], [170], [140]])

    editor.commands.undo()

    expect(getFirstRowWidths()).toEqual([[100], [120], [140]])
  })

  it('does not overwrite existing colwidths on mousedown', () => {
    editor = createResizableEditor()
    editor.commands.setContent(
      '<table><tbody><tr><td colwidth="100">A</td><td colwidth="200">B</td><td colwidth="300">C</td></tr></tbody></table>',
    )

    mockColWidths([111, 222, 333])

    const win = beginColumnResize(getCellPositions()[1])

    expect(getFirstRowWidths()).toEqual([[100], [200], [300]])

    finishColumnResize(win, 50)

    expect(getFirstRowWidths()).toEqual([[100], [250], [300]])
  })

  it('snapshots multi-value colwidth for colspan cells', () => {
    editor = createResizableEditor()
    editor.commands.setContent(
      '<table><tbody><tr><th>Name</th><th colspan="3">Description</th></tr><tr><td>A</td><td>B</td><td>C</td><td>D</td></tr></tbody></table>',
    )

    mockColWidths([100, 120, 140, 160])

    const bodyCells = getCellPositions().filter(pos => {
      const node = editor!.state.doc.nodeAt(pos)
      return node?.type.spec.tableRole === 'cell'
    })

    const win = beginColumnResize(bodyCells[1])

    expect(getFirstRowWidths()).toEqual([[100], [120, 140, 160]])

    finishColumnResize(win, 50)

    expect(getFirstRowWidths()).toEqual([[100], [170, 140, 160]])
  })
})
