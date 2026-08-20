import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import { TableKit } from '@tiptap/extension-table'
import Text from '@tiptap/extension-text'
import { afterEach, beforeEach, describe, expect, it } from 'vite-plus/test'

const countCells = (editor: Editor, selector: string) =>
  editor.view.dom.querySelectorAll(selector).length

const firstTableBounds = (editor: Editor) => {
  let start = -1
  let end = -1
  editor.state.doc.descendants((node, pos) => {
    if (node.type.name === 'table' && start === -1) {
      start = pos
      end = pos + node.nodeSize
    }
  })
  return { start, end }
}

const selectFirstTwoHeaderCells = (editor: Editor) => {
  const positions: number[] = []
  editor.state.doc.descendants((node, pos) => {
    if (node.type.name === 'tableHeader') {
      positions.push(pos)
    }
  })
  editor
    .chain()
    .focus()
    .setCellSelection({ anchorCell: positions[0], headCell: positions[1] })
    .run()
}

describe('Table commands', () => {
  let editor: Editor

  beforeEach(() => {
    const element = document.createElement('div')
    document.body.appendChild(element)
    editor = new Editor({
      element,
      extensions: [Document, Paragraph, Text, TableKit],
      content: '',
    })
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  })

  afterEach(() => {
    editor.destroy()
  })

  it('adds a table with three columns and three rows', () => {
    expect(countCells(editor, 'table')).toBe(1)
    expect(countCells(editor, 'table tr')).toBe(3)
    expect(countCells(editor, 'table th')).toBe(3)
    expect(countCells(editor, 'table td')).toBe(6)
  })

  it('adds & deletes columns', () => {
    editor.commands.addColumnBefore()
    expect(countCells(editor, 'table th')).toBe(4)

    editor.commands.addColumnAfter()
    expect(countCells(editor, 'table th')).toBe(5)

    editor.commands.deleteColumn()
    editor.commands.deleteColumn()
    expect(countCells(editor, 'table th')).toBe(3)
  })

  it('adds & deletes rows', () => {
    editor.commands.addRowBefore()
    expect(countCells(editor, 'table tr')).toBe(4)

    editor.commands.addRowAfter()
    expect(countCells(editor, 'table tr')).toBe(5)

    editor.commands.deleteRow()
    editor.commands.deleteRow()
    expect(countCells(editor, 'table tr')).toBe(3)
  })

  it('keeps the cursor inside the table when deleting the last row', () => {
    editor.commands.insertContentAt(editor.state.doc.content.size, '<p>Text below table</p>')

    let lastCellPos = 0
    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === 'tableCell') {
        lastCellPos = pos
      }
    })
    editor
      .chain()
      .focus()
      .setTextSelection(lastCellPos + 2)
      .run()

    editor.commands.deleteRow()

    expect(countCells(editor, 'table tr')).toBe(2)
    expect(editor.isActive('table')).toBe(true)
  })

  it('keeps the cursor inside the table when deleting the last column', () => {
    editor.commands.insertContentAt(editor.state.doc.content.size, '<p>Text below table</p>')

    let lastCellPos = 0
    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === 'tableCell') {
        lastCellPos = pos
      }
    })
    editor
      .chain()
      .focus()
      .setTextSelection(lastCellPos + 2)
      .run()

    editor.commands.deleteColumn()

    expect(countCells(editor, 'table th')).toBe(2)
    expect(editor.isActive('table')).toBe(true)
  })

  it('keeps the cursor in the edited table when deleting the last row with a table below', () => {
    editor.commands.insertContentAt(
      editor.state.doc.content.size,
      '<table><tbody><tr><td><p>Following table</p></td></tr></tbody></table>',
    )

    const { end: firstTableEnd } = firstTableBounds(editor)
    let lastCellPos = 0
    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === 'tableCell' && pos < firstTableEnd) {
        lastCellPos = pos
      }
    })
    editor
      .chain()
      .focus()
      .setTextSelection(lastCellPos + 2)
      .run()

    editor.commands.deleteRow()

    const { start, end } = firstTableBounds(editor)
    const cursor = editor.state.selection.from
    expect(editor.isActive('table')).toBe(true)
    expect(cursor).toBeGreaterThan(start)
    expect(cursor).toBeLessThan(end)
  })

  it('keeps the cursor in the edited table when deleting the last column with a table below', () => {
    editor.commands.insertContentAt(
      editor.state.doc.content.size,
      '<table><tbody><tr><td><p>Following table</p></td></tr></tbody></table>',
    )

    const { end: firstTableEnd } = firstTableBounds(editor)
    let lastCellPos = 0
    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === 'tableCell' && pos < firstTableEnd) {
        lastCellPos = pos
      }
    })
    editor
      .chain()
      .focus()
      .setTextSelection(lastCellPos + 2)
      .run()

    editor.commands.deleteColumn()

    const { start, end } = firstTableBounds(editor)
    const cursor = editor.state.selection.from
    expect(editor.isActive('table')).toBe(true)
    expect(cursor).toBeGreaterThan(start)
    expect(cursor).toBeLessThan(end)
  })

  it('deletes the table', () => {
    editor.commands.deleteTable()
    expect(countCells(editor, 'table')).toBe(0)
  })

  it('merges cells', () => {
    selectFirstTwoHeaderCells(editor)
    editor.commands.mergeCells()
    expect(countCells(editor, 'table th')).toBe(2)
  })

  it('splits cells', () => {
    selectFirstTwoHeaderCells(editor)
    editor.commands.mergeCells()
    expect(countCells(editor, 'table th')).toBe(2)

    editor.commands.splitCell()
    expect(countCells(editor, 'table th')).toBe(3)
  })

  it('toggles header columns', () => {
    editor.commands.toggleHeaderColumn()
    expect(countCells(editor, 'table th')).toBe(5)
  })

  it('toggles header row', () => {
    editor.commands.toggleHeaderRow()
    expect(countCells(editor, 'table th')).toBe(0)
  })

  it('merges and splits via mergeOrSplit', () => {
    selectFirstTwoHeaderCells(editor)
    editor.commands.mergeCells()
    expect(editor.view.dom.querySelector('th[colspan="2"]')).not.toBeNull()

    editor.commands.mergeOrSplit()
    expect(editor.view.dom.querySelector('th[colspan="2"]')).toBeNull()
  })

  it('creates a 1x1 table', () => {
    editor.commands.clearContent()
    editor.commands.insertTable({ cols: 1, rows: 1, withHeaderRow: false })
    expect(countCells(editor, 'td')).toBe(1)
    expect(countCells(editor, 'tr')).toBe(1)
  })

  it('creates a 3x1 table', () => {
    editor.commands.clearContent()
    editor.commands.insertTable({ cols: 3, rows: 1, withHeaderRow: false })
    expect(countCells(editor, 'td')).toBe(3)
    expect(countCells(editor, 'tr')).toBe(1)
  })

  it('creates a 1x3 table', () => {
    editor.commands.clearContent()
    editor.commands.insertTable({ cols: 1, rows: 3, withHeaderRow: false })
    expect(countCells(editor, 'td')).toBe(3)
    expect(countCells(editor, 'tr')).toBe(3)
  })

  it('creates a 1x3 table with header row', () => {
    editor.commands.clearContent()
    editor.commands.insertTable({ cols: 1, rows: 3, withHeaderRow: true })
    expect(countCells(editor, 'th')).toBe(1)
    expect(countCells(editor, 'td')).toBe(2)
    expect(countCells(editor, 'tr')).toBe(3)
  })

  it('creates a 3x3 table with defaults', () => {
    editor.commands.clearContent()
    editor.commands.insertTable()
    expect(countCells(editor, 'th')).toBe(3)
    expect(countCells(editor, 'td')).toBe(6)
    expect(countCells(editor, 'tr')).toBe(3)
  })

  it('sets a minimum width on colgroups', () => {
    editor.commands.clearContent()
    editor.commands.insertTable({ cols: 3, rows: 1, withHeaderRow: false })
    const firstCol = editor.view.dom.querySelector('col')
    expect(firstCol?.getAttribute('style')).toBe('min-width: 25px;')
  })

  it('generates correct markup for a 1x1 table', () => {
    editor.commands.clearContent()
    editor.commands.insertTable({ cols: 1, rows: 1, withHeaderRow: false })
    expect(editor.getHTML()).toBe(
      '<table style="min-width: 25px;"><colgroup><col style="min-width: 25px;"></colgroup><tbody><tr><td colspan="1" rowspan="1"><p></p></td></tr></tbody></table>',
    )
  })

  it('generates correct markup for a 1x1 table with header', () => {
    editor.commands.clearContent()
    editor.commands.insertTable({ cols: 1, rows: 1, withHeaderRow: true })
    expect(editor.getHTML()).toBe(
      '<table style="min-width: 25px;"><colgroup><col style="min-width: 25px;"></colgroup><tbody><tr><th colspan="1" rowspan="1"><p></p></th></tr></tbody></table>',
    )
  })

  it('moves focus between cells with goToNextCell / goToPreviousCell', () => {
    let firstHeaderPos = -1
    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === 'tableHeader' && firstHeaderPos === -1) {
        firstHeaderPos = pos
      }
    })

    editor
      .chain()
      .focus()
      .setTextSelection(firstHeaderPos + 1)
      .insertContent('Column 1')
      .run()

    editor.commands.goToNextCell()
    editor.commands.insertContent('Column 2')
    editor.commands.goToPreviousCell()

    const ths = editor.view.dom.querySelectorAll('table th')
    expect(ths[0].textContent).toContain('Column 1')
    expect(ths[1].textContent).toContain('Column 2')
  })
})
