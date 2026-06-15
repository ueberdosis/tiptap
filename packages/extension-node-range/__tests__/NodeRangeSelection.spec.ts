import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { Selection } from '@tiptap/pm/state'
import { afterEach, describe, expect, it } from 'vitest'

import { isNodeRangeSelection } from '../src/helpers/isNodeRangeSelection.js'
import { NodeRangeSelection } from '../src/helpers/NodeRangeSelection.js'

describe('NodeRangeSelection serialization', () => {
  let editor: Editor | null = null

  afterEach(() => {
    editor?.destroy()
    editor = null
  })

  function createEditor(content: string): Editor {
    editor = new Editor({
      element: document.body,
      extensions: [Document, Paragraph, Text],
      content,
    })

    return editor
  }

  it('registers the "nodeRange" JSON id', () => {
    const { state } = createEditor('<p>First</p><p>Second</p>')
    // jsonID is set on the prototype at registration but not in the Selection type
    const selection = NodeRangeSelection.create(state.doc, 1, 1) as NodeRangeSelection & {
      jsonID?: string
    }

    expect(selection.jsonID).toBe('nodeRange')
  })

  it('round-trips through the generic Selection.fromJSON dispatcher', () => {
    // This is the regression: without `Selection.jsonID('nodeRange', …)`,
    // `Selection.fromJSON` cannot resolve the `nodeRange` type and throws.
    const { state } = createEditor('<p>First</p><p>Second</p>')
    const selection = NodeRangeSelection.create(state.doc, 1, 1)

    const restored = Selection.fromJSON(state.doc, selection.toJSON())

    expect(isNodeRangeSelection(restored)).toBe(true)
    expect(restored.eq(selection)).toBe(true)
  })

  it('preserves depth across toJSON → fromJSON', () => {
    const { state } = createEditor('<p>First</p><p>Second</p>')
    const selection = NodeRangeSelection.create(state.doc, 1, 1, 0)

    const json = selection.toJSON()

    expect(json.depth).toBe(0)

    const restored = NodeRangeSelection.fromJSON(state.doc, json)

    expect(restored.depth).toBe(0)
  })

  it('round-trips a multi-block selection without losing its ranges', () => {
    const { state } = createEditor('<p>First</p><p>Second</p><p>Third</p>')
    const firstParagraphSize = state.doc.child(0).nodeSize
    const secondParagraphSize = state.doc.child(1).nodeSize
    // anchor inside the first paragraph, head at the boundary after the second
    const selection = NodeRangeSelection.create(
      state.doc,
      1,
      firstParagraphSize + secondParagraphSize,
    )

    expect(selection.ranges).toHaveLength(2)

    const restored = Selection.fromJSON(state.doc, selection.toJSON())

    expect(isNodeRangeSelection(restored)).toBe(true)
    expect(restored.eq(selection)).toBe(true)
    expect((restored as NodeRangeSelection).ranges).toHaveLength(2)
  })

  it('keeps depth when mapped through a transaction', () => {
    const { state } = createEditor('<p>First</p><p>Second</p>')
    const selection = NodeRangeSelection.create(state.doc, 1, 1, 0)

    const tr = state.tr.insertText('x', 1)
    const mapped = selection.map(tr.doc, tr.mapping)

    expect(mapped.depth).toBe(0)
  })
})
