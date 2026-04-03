import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { afterEach, describe, expect, it } from 'vitest'

import { getSelectionRanges } from '../src/helpers/getSelectionRanges.js'

function getNodeContentStart(nodeStart: number): number {
  return nodeStart + 1
}

function getNodeContentEnd(nodeStart: number, nodeSize: number): number {
  return nodeStart + nodeSize - 1
}

describe('getSelectionRanges', () => {
  let editor: Editor | null = null

  afterEach(() => {
    editor?.destroy()
    editor = null
  })

  it('extends the trailing range by default when the selection ends at the next node start', () => {
    editor = new Editor({
      element: document.body,
      extensions: [Document, Paragraph, Text],
      content: '<p>First</p><p>Second</p>',
    })

    const firstParagraphStart = 0
    const firstParagraphSize = editor.state.doc.child(0).nodeSize
    const secondParagraphStart = firstParagraphSize
    const $from = editor.state.doc.resolve(getNodeContentStart(firstParagraphStart))
    const $to = editor.state.doc.resolve(getNodeContentStart(secondParagraphStart))

    const ranges = getSelectionRanges($from, $to, 0)

    expect(ranges).toHaveLength(2)
    expect(ranges[0].$from.pos).toBe(firstParagraphStart)
    expect(ranges[1].$from.pos).toBe(secondParagraphStart)
  })

  it('does not extend the trailing range when boundary overlap is disabled', () => {
    editor = new Editor({
      element: document.body,
      extensions: [Document, Paragraph, Text],
      content: '<p>First</p><p>Second</p>',
    })

    const firstParagraphStart = 0
    const firstParagraphSize = editor.state.doc.child(0).nodeSize
    const secondParagraphStart = firstParagraphSize
    const $from = editor.state.doc.resolve(getNodeContentStart(firstParagraphStart))
    const $to = editor.state.doc.resolve(getNodeContentStart(secondParagraphStart))

    const ranges = getSelectionRanges($from, $to, 0, {
      extendOnBoundaryOverlap: false,
    })

    expect(ranges).toHaveLength(1)
    expect(ranges[0].$from.pos).toBe(firstParagraphStart)
    expect(ranges[0].$to.pos).toBe(secondParagraphStart)
  })

  it('extends the leading range by default when the selection starts at the previous node end', () => {
    editor = new Editor({
      element: document.body,
      extensions: [Document, Paragraph, Text],
      content: '<p>First</p><p>Second</p>',
    })

    const firstParagraphStart = 0
    const firstParagraphSize = editor.state.doc.child(0).nodeSize
    const secondParagraphStart = firstParagraphSize
    const secondParagraphSize = editor.state.doc.child(1).nodeSize
    const $from = editor.state.doc.resolve(getNodeContentEnd(firstParagraphStart, firstParagraphSize))
    const $to = editor.state.doc.resolve(getNodeContentEnd(secondParagraphStart, secondParagraphSize))

    const ranges = getSelectionRanges($from, $to, 0)

    expect(ranges).toHaveLength(2)
    expect(ranges[0].$from.pos).toBe(firstParagraphStart)
    expect(ranges[1].$from.pos).toBe(secondParagraphStart)
  })

  it('does not extend the leading range when boundary overlap is disabled', () => {
    editor = new Editor({
      element: document.body,
      extensions: [Document, Paragraph, Text],
      content: '<p>First</p><p>Second</p>',
    })

    const firstParagraphStart = 0
    const firstParagraphSize = editor.state.doc.child(0).nodeSize
    const secondParagraphStart = firstParagraphSize
    const secondParagraphSize = editor.state.doc.child(1).nodeSize
    const $from = editor.state.doc.resolve(getNodeContentEnd(firstParagraphStart, firstParagraphSize))
    const $to = editor.state.doc.resolve(getNodeContentEnd(secondParagraphStart, secondParagraphSize))

    const ranges = getSelectionRanges($from, $to, 0, {
      extendOnBoundaryOverlap: false,
    })

    expect(ranges).toHaveLength(1)
    expect(ranges[0].$from.pos).toBe(secondParagraphStart)
    expect(ranges[0].$to.pos).toBe(secondParagraphStart + secondParagraphSize)
  })
})
