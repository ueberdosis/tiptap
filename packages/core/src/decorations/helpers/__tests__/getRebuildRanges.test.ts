import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { describe, expect, it } from 'vitest'

import { getRebuildRanges } from '../getRebuildRanges.js'

function createEditor(content: string) {
  return new Editor({
    extensions: [Document, Paragraph, Text],
    content,
  })
}

// <p>aaa</p><p>bbb</p><p>ccc</p> → blocks at 0-5, 5-10, 10-15
const THREE_BLOCKS = '<p>aaa</p><p>bbb</p><p>ccc</p>'

describe('getRebuildRanges', () => {
  it('returns the containing block for an edit inside one block', () => {
    const editor = createEditor(THREE_BLOCKS)
    const tr = editor.state.tr.insertText('x', 7)

    expect(getRebuildRanges(tr, tr.doc)).toEqual({ type: 'ranges', ranges: [{ from: 5, to: 11 }] })

    editor.destroy()
  })

  it('includes the previous block when the change starts on a block boundary', () => {
    const editor = createEditor(THREE_BLOCKS)
    // Position 5 is the boundary between the first and second block. The first
    // block ends there, so decorations spanning the boundary must be rebuilt.
    const tr = editor.state.tr.insertText('x', 5)
    const result = getRebuildRanges(tr, tr.doc)

    expect(result.type).toBe('ranges')
    expect(result.type === 'ranges' && result.ranges[0].from).toBe(0)

    editor.destroy()
  })

  it('covers every block a multi-block change touches', () => {
    const editor = createEditor(THREE_BLOCKS)
    const tr = editor.state.tr.delete(2, 12)
    const result = getRebuildRanges(tr, tr.doc)

    expect(result.type).toBe('ranges')
    expect(result.type === 'ranges' && result.ranges).toEqual([
      { from: 0, to: tr.doc.content.size },
    ])

    editor.destroy()
  })

  it('merges overlapping ranges from multiple steps', () => {
    const editor = createEditor(THREE_BLOCKS)
    const tr = editor.state.tr.insertText('x', 2).insertText('y', 8)
    const result = getRebuildRanges(tr, tr.doc)

    expect(result.type).toBe('ranges')
    expect(result.type === 'ranges' && result.ranges).toEqual([{ from: 0, to: 12 }])

    editor.destroy()
  })

  it('covers the neighbouring blocks for an attribute-only step', () => {
    const editor = createEditor(THREE_BLOCKS)
    // setNodeMarkup maps the block's open and close positions, so both
    // neighbours end up touching one of the mapped ranges.
    const tr = editor.state.tr.setNodeMarkup(5, undefined, { textAlign: 'center' })
    const result = getRebuildRanges(tr, tr.doc)

    expect(result.type).toBe('ranges')
    expect(result.type === 'ranges' && result.ranges).toEqual([{ from: 0, to: 15 }])

    editor.destroy()
  })

  it('falls back to a full rebuild for steps without a resolvable range', () => {
    const editor = createEditor(THREE_BLOCKS)
    const tr = editor.state.tr.replace(0, editor.state.doc.content.size)

    expect(getRebuildRanges(tr, tr.doc).type).toBe('ranges')

    editor.destroy()
  })

  it('returns no ranges for an empty document', () => {
    const editor = createEditor('<p></p>')
    const tr = editor.state.tr.insertText('x', 1)

    expect(getRebuildRanges(tr, tr.doc)).toEqual({ type: 'ranges', ranges: [{ from: 0, to: 3 }] })

    editor.destroy()
  })
})
