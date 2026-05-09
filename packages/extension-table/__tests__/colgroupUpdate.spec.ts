import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import { Table, TableCell, TableHeader, TableRow } from '@tiptap/extension-table'
import Text from '@tiptap/extension-text'
import { afterEach, describe, expect, it } from 'vitest'

describe('colgroup updates after column commands', () => {
  const editorElClass = 'tiptap'
  let editor: Editor | null = null

  const createEditorEl = () => {
    const editorEl = document.createElement('div')

    editorEl.classList.add(editorElClass)
    document.body.appendChild(editorEl)
    return editorEl
  }
  const getEditorEl = () => document.querySelector(`.${editorElClass}`)

  const createEditor = (resizable: boolean) =>
    new Editor({
      element: createEditorEl(),
      extensions: [Document, Text, Paragraph, TableCell, TableHeader, TableRow, Table.configure({ resizable })],
    })

  const countCols = (e: Editor) => e.view.dom.querySelectorAll('colgroup > col').length

  const countCellsInFirstRow = (e: Editor) => {
    const firstRow = e.view.dom.querySelector('tbody > tr')

    return firstRow ? firstRow.querySelectorAll('td, th').length : 0
  }

  // Place cursor inside the first cell of the table so column commands have a target
  const focusFirstCell = (e: Editor) => {
    e.commands.focus()
    e.commands.setTextSelection(3)
  }

  afterEach(() => {
    editor?.destroy()
    editor = null
    getEditorEl()?.remove()
  })

  describe('resizable: false (default — bug case)', () => {
    it('updates <colgroup> when a column is deleted', () => {
      editor = createEditor(false)
      editor.commands.insertTable({ rows: 3, cols: 3, withHeaderRow: true })

      expect(countCols(editor)).toBe(3)
      expect(countCellsInFirstRow(editor)).toBe(3)

      focusFirstCell(editor)
      editor.commands.deleteColumn()

      expect(countCellsInFirstRow(editor)).toBe(2)
      expect(countCols(editor)).toBe(2)
    })

    it('updates <colgroup> when a column is added after', () => {
      editor = createEditor(false)
      editor.commands.insertTable({ rows: 3, cols: 3, withHeaderRow: true })

      expect(countCols(editor)).toBe(3)

      focusFirstCell(editor)
      editor.commands.addColumnAfter()

      expect(countCellsInFirstRow(editor)).toBe(4)
      expect(countCols(editor)).toBe(4)
    })

    it('updates <colgroup> when a column is added before', () => {
      editor = createEditor(false)
      editor.commands.insertTable({ rows: 3, cols: 3, withHeaderRow: true })

      expect(countCols(editor)).toBe(3)

      focusFirstCell(editor)
      editor.commands.addColumnBefore()

      expect(countCellsInFirstRow(editor)).toBe(4)
      expect(countCols(editor)).toBe(4)
    })
  })

  describe('resizable: true (control — should already work)', () => {
    it('updates <colgroup> when a column is deleted', () => {
      editor = createEditor(true)
      editor.commands.insertTable({ rows: 3, cols: 3, withHeaderRow: true })

      expect(countCols(editor)).toBe(3)

      focusFirstCell(editor)
      editor.commands.deleteColumn()

      expect(countCellsInFirstRow(editor)).toBe(2)
      expect(countCols(editor)).toBe(2)
    })

    it('updates <colgroup> when a column is added after', () => {
      editor = createEditor(true)
      editor.commands.insertTable({ rows: 3, cols: 3, withHeaderRow: true })

      expect(countCols(editor)).toBe(3)

      focusFirstCell(editor)
      editor.commands.addColumnAfter()

      expect(countCellsInFirstRow(editor)).toBe(4)
      expect(countCols(editor)).toBe(4)
    })
  })

  describe('edge cases (resizable: false)', () => {
    const getTable = (e: Editor) => e.view.dom.querySelector('table') as HTMLTableElement

    it('updates <table> min-width style when columns change', () => {
      editor = createEditor(false)
      editor.commands.insertTable({ rows: 2, cols: 3, withHeaderRow: false })

      // Default cellMinWidth is 25px → 3 cols × 25 = 75px
      expect(getTable(editor).style.minWidth).toBe('75px')

      focusFirstCell(editor)
      editor.commands.deleteColumn()
      expect(getTable(editor).style.minWidth).toBe('50px')

      editor.commands.addColumnAfter()
      expect(getTable(editor).style.minWidth).toBe('75px')
    })

    it('keeps <colgroup> consistent after mergeCells (no col change expected)', () => {
      editor = createEditor(false)
      editor.commands.insertTable({ rows: 2, cols: 3, withHeaderRow: false })

      const initialCols = countCols(editor)

      // select two adjacent cells then merge
      editor.commands.focus()
      editor.commands.setTextSelection({ from: 3, to: 8 })
      editor.commands.mergeCells()

      // mergeCells uses colspan; column count must not change
      expect(countCols(editor)).toBe(initialCols)
    })

    it('updates <colgroup> in read-only mode when columns change programmatically', () => {
      editor = createEditor(false)
      editor.commands.insertTable({ rows: 2, cols: 3, withHeaderRow: false })

      editor.setEditable(false)

      expect(countCols(editor)).toBe(3)

      focusFirstCell(editor)
      editor.commands.deleteColumn()

      expect(countCellsInFirstRow(editor)).toBe(2)
      expect(countCols(editor)).toBe(2)
    })

    it('preserves remaining colwidths when a column is deleted', () => {
      editor = createEditor(false)
      editor.commands.setContent(
        '<table><tbody><tr><td colwidth="100">A</td><td colwidth="200">B</td><td colwidth="300">C</td></tr></tbody></table>',
      )

      const widthsOf = () =>
        Array.from(editor!.view.dom.querySelectorAll<HTMLTableColElement>('colgroup > col')).map(c => c.style.width)

      expect(widthsOf()).toEqual(['100px', '200px', '300px'])

      // place cursor in the first cell, then delete it
      editor.commands.focus()
      editor.commands.setTextSelection(3)
      editor.commands.deleteColumn()

      // remaining widths must be the original 200 and 300, not 100/200 (which would
      // indicate widths got reassigned to the wrong columns after the deletion)
      expect(widthsOf()).toEqual(['200px', '300px'])
    })
  })
})
