import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import { TableKit } from '@tiptap/extension-table'
import Text from '@tiptap/extension-text'
import { afterEach, describe, expect, it } from 'vitest'

const callClipboardTextSerializer = (editor: Editor): string => {
  const serializer = editor.view.someProp('clipboardTextSerializer') as
    | ((slice: ReturnType<typeof editor.state.selection.content>) => string)
    | undefined

  if (!serializer) {
    throw new Error('clipboardTextSerializer prop not registered')
  }

  return serializer(editor.state.selection.content())
}

const collectCellPositions = (editor: Editor): number[] => {
  const positions: number[] = []
  editor.state.doc.descendants((node, pos) => {
    if (node.type.name === 'tableCell' || node.type.name === 'tableHeader') {
      positions.push(pos)
    }
  })
  return positions
}

describe('Table plain-text clipboard serialization', () => {
  let editor: Editor

  afterEach(() => {
    editor?.destroy()
  })

  it('only serializes selected cells when CellSelection spans non-adjacent rows', () => {
    const element = document.createElement('div')
    document.body.appendChild(element)
    editor = new Editor({
      element,
      extensions: [Document, Paragraph, Text, TableKit],
      content: `
        <table>
          <tbody>
            <tr><td>A1</td><td>B1</td></tr>
            <tr><td>A2</td><td>B2</td></tr>
            <tr><td>A3</td><td>B3</td></tr>
          </tbody>
        </table>
      `,
    })

    // Document order: A1, B1, A2, B2, A3, B3
    const cells = collectCellPositions(editor)

    // Select column 0 across all three rows: A1 -> A3.
    // ProseMirror's CellSelection turns this into a rectangular selection
    // covering A1, A2, A3 only. The bug was that the plain-text serializer
    // also pulled in B1 and B2 because they sit between A1 and A3 in doc order.
    editor.chain().focus().setCellSelection({ anchorCell: cells[0], headCell: cells[4] }).run()

    const result = callClipboardTextSerializer(editor)

    expect(result).toContain('A1')
    expect(result).toContain('A2')
    expect(result).toContain('A3')
    expect(result).not.toContain('B1')
    expect(result).not.toContain('B2')
    expect(result).not.toContain('B3')
  })

  it('emits cells in document order even when CellSelection is built bottom-up', () => {
    const element = document.createElement('div')
    document.body.appendChild(element)
    editor = new Editor({
      element,
      extensions: [Document, Paragraph, Text, TableKit],
      content: `
        <table>
          <tbody>
            <tr><td>A1</td><td>B1</td></tr>
            <tr><td>A2</td><td>B2</td></tr>
            <tr><td>A3</td><td>B3</td></tr>
          </tbody>
        </table>
      `,
    })

    const cells = collectCellPositions(editor)

    // Reverse selection: anchor on the bottom cell, head on the top cell.
    // Simulates a user dragging upward. ranges may not be in doc order.
    editor.chain().focus().setCellSelection({ anchorCell: cells[4], headCell: cells[0] }).run()

    const result = callClipboardTextSerializer(editor)

    expect(result.indexOf('A1')).toBeLessThan(result.indexOf('A2'))
    expect(result.indexOf('A2')).toBeLessThan(result.indexOf('A3'))
  })

  it('serializes adjacent cells in a row without dropping content', () => {
    const element = document.createElement('div')
    document.body.appendChild(element)
    editor = new Editor({
      element,
      extensions: [Document, Paragraph, Text, TableKit],
      content: `
        <table>
          <tbody>
            <tr><td>A1</td><td>B1</td><td>C1</td></tr>
            <tr><td>A2</td><td>B2</td><td>C2</td></tr>
          </tbody>
        </table>
      `,
    })

    // Document order: A1, B1, C1, A2, B2, C2
    const cells = collectCellPositions(editor)

    // Select A1 and B1 (same row, adjacent).
    editor.chain().focus().setCellSelection({ anchorCell: cells[0], headCell: cells[1] }).run()

    const result = callClipboardTextSerializer(editor)

    expect(result).toContain('A1')
    expect(result).toContain('B1')
    expect(result).not.toContain('C1')
    expect(result).not.toContain('A2')
  })
})
