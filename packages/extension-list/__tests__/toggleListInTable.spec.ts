import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import { TableKit } from '@tiptap/extension-table'
import Text from '@tiptap/extension-text'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { BulletList, ListItem, OrderedList } from '../src/index.js'

/**
 * Regression tests for https://github.com/ueberdosis/tiptap/issues/7208
 *
 * When several table cells are selected (a ProseMirror `CellSelection`) and a
 * list toggle is triggered, every selected cell should be toggled - not only
 * the first one. A `CellSelection` exposes one range per cell via
 * `selection.ranges`, but its `$from`/`$to` resolve to the first cell only, so
 * the single-range toggle logic previously affected just that first cell.
 */
describe('toggleList across a table CellSelection', () => {
  let editor: Editor

  const collectCellPositions = (): number[] => {
    const positions: number[] = []
    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === 'tableCell' || node.type.name === 'tableHeader') {
        positions.push(pos)
      }
    })
    return positions
  }

  // The type name of each cell's first child, in row-major order.
  const cellChildTypes = (): string[] => {
    const types: string[] = []
    editor.state.doc.descendants(node => {
      if (node.type.name === 'tableCell' || node.type.name === 'tableHeader') {
        types.push(node.firstChild?.type.name ?? '')
      }
    })
    return types
  }

  beforeEach(() => {
    const element = document.createElement('div')
    document.body.appendChild(element)
    editor = new Editor({
      element,
      extensions: [Document, Paragraph, Text, ListItem, BulletList, OrderedList, TableKit],
      content:
        '<table><tbody>' +
        '<tr><td>A1</td><td>B1</td></tr>' +
        '<tr><td>A2</td><td>B2</td></tr>' +
        '</tbody></table>',
    })
  })

  afterEach(() => {
    editor.destroy()
  })

  it('toggles a bullet list in every selected cell, not just the first', () => {
    const cells = collectCellPositions()
    // Row-major order: A1, B1, A2, B2. Select the whole first row (A1..B1).
    editor.chain().focus().setCellSelection({ anchorCell: cells[0], headCell: cells[1] }).run()

    const result = editor.commands.toggleBulletList()

    expect(result).toBe(true)

    const types = cellChildTypes()
    // Both selected cells become lists.
    expect(types[0]).toBe('bulletList') // A1
    expect(types[1]).toBe('bulletList') // B1
    // Unselected cells are untouched.
    expect(types[2]).toBe('paragraph') // A2
    expect(types[3]).toBe('paragraph') // B2

    // The original cell text is preserved inside the new lists.
    const contents: string[] = []
    editor.state.doc.descendants(node => {
      if (node.type.name === 'tableCell') {
        contents.push(node.textContent)
      }
    })
    expect(contents).toEqual(['A1', 'B1', 'A2', 'B2'])
  })

  it('toggles an ordered list in all cells of a multi-row, multi-column selection', () => {
    const cells = collectCellPositions()
    // Select the full 2x2 block A1..B2.
    editor.chain().focus().setCellSelection({ anchorCell: cells[0], headCell: cells[3] }).run()

    const result = editor.commands.toggleOrderedList()

    expect(result).toBe(true)

    const types = cellChildTypes()
    expect(types).toEqual(['orderedList', 'orderedList', 'orderedList', 'orderedList'])
  })

  it('toggles a list off again in every selected cell on a second toggle', () => {
    const cells = collectCellPositions()
    editor.chain().focus().setCellSelection({ anchorCell: cells[0], headCell: cells[1] }).run()

    editor.commands.toggleBulletList()
    expect(cellChildTypes().slice(0, 2)).toEqual(['bulletList', 'bulletList'])

    // Re-select the same cells and toggle again - both cells should revert.
    const cellsAfter = collectCellPositions()
    editor
      .chain()
      .focus()
      .setCellSelection({ anchorCell: cellsAfter[0], headCell: cellsAfter[1] })
      .run()
    editor.commands.toggleBulletList()

    expect(cellChildTypes()).toEqual(['paragraph', 'paragraph', 'paragraph', 'paragraph'])
  })
})

describe('toggleList outside tables (regression guard)', () => {
  let editor: Editor

  afterEach(() => {
    editor?.destroy()
  })

  it('still toggles a single paragraph into a bullet list', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, ListItem, BulletList],
      content: '<p>Hello</p>',
    })

    editor.commands.selectAll()
    const result = editor.commands.toggleBulletList()

    expect(result).toBe(true)
    expect(editor.getHTML()).toBe('<ul><li><p>Hello</p></li></ul>')
  })
})
