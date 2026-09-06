import { Editor, getChangedRanges } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { describe, expect, it } from 'vite-plus/test'

import { getTopLevelBlocksInRange, toContentRelativeRange } from './resolveTopLevelRange.js'

function createHeadlessEditor(content: string) {
  return new Editor({
    element: null,
    extensions: [Document, Paragraph, Text],
    content,
  })
}

describe('placeholder utility: getTopLevelBlocksInRange', () => {
  it('returns content-relative ranges aligned with nodesBetween positions', () => {
    const editor = createHeadlessEditor('<p></p><p></p><p></p>')

    const doc = editor.state.doc
    const nodesBetweenPositions: number[] = []

    doc.nodesBetween(0, doc.content.size, (node, pos) => {
      if (node.type.name === 'paragraph') {
        nodesBetweenPositions.push(pos)
      }
    })

    const blocks = getTopLevelBlocksInRange(doc, 1, 2)

    expect(blocks).toEqual([{ from: 0, to: 2 }])
    expect(blocks[0]?.from).toBe(nodesBetweenPositions[0])

    editor.destroy()
  })

  it('aligns resolveTopLevelRange + toContentRelativeRange with getTopLevelBlocksInRange', () => {
    const editor = createHeadlessEditor('<p></p><p></p><p></p>')

    const doc = editor.state.doc

    doc.forEach((node, offset) => {
      const contentRange = { from: offset, to: offset + node.nodeSize }
      const absoluteRange = { from: offset + 1, to: offset + node.nodeSize + 1 }

      expect(toContentRelativeRange(doc, absoluteRange)).toEqual(contentRange)
      expect(getTopLevelBlocksInRange(doc, absoluteRange.from, absoluteRange.to)).toEqual([
        contentRange,
      ])
    })

    editor.destroy()
  })

  it('collects only the touched top-level block for a single-paragraph edit', () => {
    const editor = createHeadlessEditor('<p></p><p></p><p></p>')

    const changes: Array<{ from: number; to: number }> = []

    editor.on('transaction', ({ transaction }) => {
      if (transaction.docChanged) {
        for (const change of getChangedRanges(transaction)) {
          changes.push(change.newRange)
        }
      }
    })

    editor.commands.insertContent('Hello')

    const doc = editor.state.doc
    const blocks = changes.flatMap(change => getTopLevelBlocksInRange(doc, change.from, change.to))

    expect(blocks).toEqual([{ from: 0, to: 7 }])

    editor.destroy()
  })
})
