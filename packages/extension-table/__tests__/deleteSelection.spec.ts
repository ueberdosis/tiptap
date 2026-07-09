import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import { TableKit } from '@tiptap/extension-table'
import Text from '@tiptap/extension-text'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

const collectCellPositions = (editor: Editor): number[] => {
  const positions: number[] = []
  editor.state.doc.descendants((node, pos) => {
    if (node.type.name === 'tableCell' || node.type.name === 'tableHeader') {
      positions.push(pos)
    }
  })
  return positions
}

const getCellContents = (editor: Editor): string[] => {
  const contents: string[] = []
  editor.state.doc.descendants(node => {
    if (node.type.name === 'tableCell' || node.type.name === 'tableHeader') {
      contents.push(node.textContent)
    }
  })
  return contents
}

describe('deleteSelection with CellSelection', () => {
  let editor: Editor

  beforeEach(() => {
    const element = document.createElement('div')
    document.body.appendChild(element)
    editor = new Editor({
      element,
      extensions: [Document, Paragraph, Text, TableKit],
      content:
        '<table><tbody><tr><td>A1</td><td>B1</td><td>C1</td></tr><tr><td>A2</td><td>B2</td><td>C2</td></tr></tbody></table>',
    })
  })

  afterEach(() => {
    editor.destroy()
  })

  it('clears every selected cell in a multi-cell CellSelection', () => {
    const cells = collectCellPositions(editor)
    // Row-major order: A1, B1, C1, A2, B2, C2
    // Select the 2x2 block A1..B2, leaving C1 and C2 untouched.
    editor.chain().focus().setCellSelection({ anchorCell: cells[0], headCell: cells[4] }).run()

    const result = editor.commands.deleteSelection()

    expect(result).toBe(true)

    const contents = getCellContents(editor)
    expect(contents[0]).toBe('') // A1
    expect(contents[1]).toBe('') // B1
    expect(contents[2]).toBe('C1')
    expect(contents[3]).toBe('') // A2
    expect(contents[4]).toBe('') // B2
    expect(contents[5]).toBe('C2')
  })
})
