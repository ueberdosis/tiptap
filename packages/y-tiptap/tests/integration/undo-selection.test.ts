import { expect, it } from 'vite-plus/test'
import * as Y from 'yjs'
import { Schema } from 'prosemirror-model'
import type { Node } from 'prosemirror-model'
import type { EditorView } from 'prosemirror-view'
import { TextSelection } from 'prosemirror-state'
import { liftEmptyBlock } from 'prosemirror-commands'
import { addListNodes, liftListItem } from 'prosemirror-schema-list'
import { undo, redo, yUndoPluginKey } from '@tiptap/y-tiptap'
import { createTestView } from '../utils/createTestView.js'
import { schema } from '../utils/testSchema.js'

const listSchema = new Schema({
  nodes: addListNodes(schema.spec.nodes, 'paragraph block*', 'block'),
  marks: schema.spec.marks,
})
const paragraph = (text: string) =>
  listSchema.node('paragraph', null, text ? listSchema.text(text) : null)
const bulletList = (texts: string[]) =>
  listSchema.node(
    'bullet_list',
    null,
    texts.map(text => listSchema.node('list_item', null, paragraph(text))),
  )

const checkUndoRedoSelection = (
  doc: Node,
  anchor: number,
  head: number,
  edit: (view: EditorView) => void,
) => {
  const document = new Y.Doc()
  const view = createTestView(document, listSchema, true)
  try {
    view.dispatch(view.state.tr.replaceWith(0, view.state.doc.content.size, doc.content))
    yUndoPluginKey.getState(view.state)!.undoManager.clear()
    view.dispatch(view.state.tr.setSelection(TextSelection.create(view.state.doc, anchor, head)))
    const before = view.state
    edit(view)
    const after = view.state
    expect(before.doc.eq(after.doc)).toBe(false)

    for (let cycle = 0; cycle < 2; cycle++) {
      undo(view.state)
      expect(view.state.doc.eq(before.doc)).toBe(true)
      expect(view.state.selection.toJSON()).toEqual(before.selection.toJSON())
      redo(view.state)
      expect(view.state.doc.eq(after.doc)).toBe(true)
      expect(view.state.selection.toJSON()).toEqual(after.selection.toJSON())
    }
  } finally {
    view.destroy()
    document.destroy()
  }
}

it('restores the cursor after exiting an empty final bullet', () => {
  const list = bulletList(['one', 'two', ''])
  const doc = listSchema.node('doc', null, [
    list,
    paragraph('below'),
    paragraph(''),
    paragraph('last'),
  ])
  const cursor = list.nodeSize - 3
  checkUndoRedoSelection(doc, cursor, cursor, view => {
    expect(liftEmptyBlock(view.state, view.dispatch)).toBe(true)
  })
})

it('restores the text offset after lifting a populated middle bullet', () => {
  const list = bulletList(['one', 'second', 'three'])
  const doc = listSchema.node('doc', null, [
    list,
    paragraph('below'),
    paragraph(''),
    paragraph('last'),
  ])
  const cursor = 1 + list.child(0).nodeSize + 2 + 3
  checkUndoRedoSelection(doc, cursor, cursor, view => {
    expect(liftListItem(listSchema.nodes.list_item)(view.state, view.dispatch)).toBe(true)
  })
})

it('restores a backward selection deleted through the document end', () => {
  const doc = listSchema.node('doc', null, [
    paragraph('start'),
    paragraph('middle'),
    paragraph('last paragraph'),
  ])
  checkUndoRedoSelection(doc, doc.content.size - 1, 3, view => {
    view.dispatch(view.state.tr.deleteSelection())
  })
})
