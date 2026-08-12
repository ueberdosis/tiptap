import { Schema } from '@tiptap/pm/model'
import { EditorState, NodeSelection, TextSelection } from '@tiptap/pm/state'
import { describe, expect, it } from 'vitest'

import { canNodeViewBeSelected } from '../canNodeViewBeSelected.js'
import { isNodeViewSelected } from '../isNodeViewSelected.js'

const schema = new Schema({
  nodes: {
    doc: { content: 'block+' },
    paragraph: { content: 'text*', group: 'block' },
    text: {},
  },
})

const stateWithParagraphs = (count: number) => {
  return EditorState.create({
    doc: schema.node(
      'doc',
      null,
      Array.from({ length: count }, () => schema.node('paragraph', null, schema.text('hello'))),
    ),
  })
}

describe('canNodeViewBeSelected', () => {
  it('is false for a collapsed selection', () => {
    const state = stateWithParagraphs(3)
    const selection = TextSelection.create(state.doc, 3)

    expect(canNodeViewBeSelected({ selection, nodeSize: 7 })).toBe(false)
  })

  it('is true for a collapsed selection when selectedOnTextSelection is set', () => {
    const state = stateWithParagraphs(3)
    const selection = TextSelection.create(state.doc, 3)

    expect(canNodeViewBeSelected({ selection, nodeSize: 7, selectedOnTextSelection: true })).toBe(
      true,
    )
  })

  it('is true when the selection spans at least the node', () => {
    const state = stateWithParagraphs(3)
    const selection = NodeSelection.create(state.doc, 0)

    expect(canNodeViewBeSelected({ selection, nodeSize: 7 })).toBe(true)
  })

  it('is never false while isNodeViewSelected is true', () => {
    const state = stateWithParagraphs(4)

    // Every position and every selection this document allows.
    const selections = [
      TextSelection.create(state.doc, 1),
      TextSelection.create(state.doc, 1, 4),
      TextSelection.create(state.doc, 1, 10),
      TextSelection.create(state.doc, 0, state.doc.content.size),
      NodeSelection.create(state.doc, 0),
      NodeSelection.create(state.doc, 7),
    ]

    selections.forEach(selection => {
      state.doc.descendants((node, pos) => {
        const selected = isNodeViewSelected({ selection, pos, nodeSize: node.nodeSize })

        if (selected) {
          expect(canNodeViewBeSelected({ selection, nodeSize: node.nodeSize })).toBe(true)
        }
      })
    })
  })
})
