import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import type { Node } from '@tiptap/pm/model'
import type { Transaction } from '@tiptap/pm/state'
import { AttrStep } from '@tiptap/pm/transform'
import { describe, expect, it } from 'vitest'

import { getRebuildRanges } from '../getRebuildRanges.js'
import { isAttrStep } from '../isAttrStep.js'

import type { Range } from '../../../types.js'

function createEditor(content: string) {
  return new Editor({
    extensions: [Document, Paragraph, Text],
    content,
  })
}

/** Asserts the resolution is incremental and returns its ranges. */
function rebuiltRanges(tr: Transaction, doc: Node): Range[] {
  const resolution = getRebuildRanges(tr, doc)

  expect(resolution.type).toBe('ranges')

  return resolution.type === 'ranges' ? resolution.ranges : []
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

    expect(rebuiltRanges(tr, tr.doc)[0].from).toBe(0)

    editor.destroy()
  })

  it('covers every block a multi-block change touches', () => {
    const editor = createEditor(THREE_BLOCKS)
    const tr = editor.state.tr.delete(2, 12)

    expect(rebuiltRanges(tr, tr.doc)).toEqual([{ from: 0, to: tr.doc.content.size }])

    editor.destroy()
  })

  it('merges overlapping ranges from multiple steps', () => {
    const editor = createEditor(THREE_BLOCKS)
    const tr = editor.state.tr.insertText('x', 2).insertText('y', 8)

    expect(rebuiltRanges(tr, tr.doc)).toEqual([{ from: 0, to: 12 }])

    editor.destroy()
  })

  it('covers the neighbouring blocks for a setNodeMarkup step', () => {
    const editor = createEditor(THREE_BLOCKS)
    // setNodeMarkup maps the block's open and close positions, so both
    // neighbours end up touching one of the mapped ranges.
    const tr = editor.state.tr.setNodeMarkup(5, undefined, { textAlign: 'center' })

    expect(rebuiltRanges(tr, tr.doc)).toEqual([{ from: 0, to: 15 }])

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

  it('returns the target block for an attribute-only step', () => {
    const editor = createEditor(THREE_BLOCKS)
    // setNodeAttribute produces an AttrStep, which maps no position at all.
    const tr = editor.state.tr.setNodeAttribute(5, 'textAlign', 'center')

    expect(rebuiltRanges(tr, tr.doc)).toEqual([{ from: 0, to: 10 }])

    editor.destroy()
  })
})

// Fails on a prosemirror-transform upgrade that breaks what getRebuildRanges
// assumes, instead of decorations going silently stale.
describe('AttrStep contract (prosemirror-transform 1.12.0)', () => {
  it('is tagged "attr", exposes pos, and maps no positions', () => {
    const step = new AttrStep(5, 'textAlign', 'center')
    let mappedRanges = 0

    step.getMap().forEach(() => {
      mappedRanges += 1
    })

    expect(isAttrStep(step)).toBe(true)
    expect(step.pos).toBe(5)
    expect(mappedRanges).toBe(0)
  })

  it('is produced by setNodeAttribute', () => {
    const editor = createEditor(THREE_BLOCKS)
    const tr = editor.state.tr.setNodeAttribute(5, 'textAlign', 'center')

    expect(tr.steps).toHaveLength(1)
    expect(isAttrStep(tr.steps[0])).toBe(true)

    editor.destroy()
  })

  it('does not match other step types', () => {
    const editor = createEditor(THREE_BLOCKS)
    const tr = editor.state.tr.insertText('x', 2).setDocAttribute('revision', 1)

    expect(tr.steps.some(isAttrStep)).toBe(false)

    editor.destroy()
  })
})
