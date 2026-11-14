import { assert, it } from 'vite-plus/test'
import type { EditorView } from 'prosemirror-view'
import { Schema } from 'prosemirror-model'
import type * as PModel from 'prosemirror-model'
import { TextSelection } from 'prosemirror-state'
import * as basicSchema from 'prosemirror-schema-basic'
import { addListNodes, liftListItem } from 'prosemirror-schema-list'
import * as Y from 'yjs'
import { createTestView } from '../utils/createTestView.js'
import { syncDocuments } from '../utils/syncDocuments.js'

const listSchema = new Schema({
  nodes: addListNodes(basicSchema.schema.spec.nodes, 'paragraph block*', 'block'),
  marks: basicSchema.schema.spec.marks,
})

const paragraph = (text: string) => listSchema.node('paragraph', null, listSchema.text(text))

const item = (text: string, ...nested: PModel.Node[]) =>
  listSchema.node('list_item', null, [paragraph(text), ...nested])

const list = (...items: (string | PModel.Node)[]) =>
  listSchema.node(
    'ordered_list',
    null,
    items.map(entry => (typeof entry === 'string' ? item(entry) : entry)),
  )

const findText = (view: EditorView, text: string) => {
  let found = -1
  view.state.doc.descendants((node, pos) => {
    if (node.isText && node.text === text) {
      found = pos
    }
  })
  return found
}

const lift = (view: EditorView, text: string) => {
  const pos = findText(view, text)
  view.dispatch(view.state.tr.setSelection(TextSelection.create(view.state.doc, pos)))
  liftListItem(listSchema.nodes.list_item)(view.state, view.dispatch)
}

// Runs one edit per client before they exchange updates and returns the merged document.
const editConcurrently = (
  firstEdit: (view: EditorView) => void,
  secondEdit: (view: EditorView) => void,
) => {
  const firstDoc = new Y.Doc()
  const secondDoc = new Y.Doc()
  const first = createTestView(firstDoc, listSchema)
  const second = createTestView(secondDoc, listSchema)
  try {
    first.dispatch(
      first.state.tr.replaceWith(0, first.state.doc.content.size, [
        paragraph('Intro'),
        list('First', 'Second'),
        paragraph('After'),
      ]),
    )
    syncDocuments(firstDoc, secondDoc)
    firstEdit(first)
    secondEdit(second)
    syncDocuments(firstDoc, secondDoc)
    assert.deepEqual(first.state.doc.toJSON(), second.state.doc.toJSON())
    return first.state.doc
  } finally {
    first.destroy()
    second.destroy()
  }
}

it('keeps concurrent typing in a list when another item is lifted out of it', () => {
  const doc = editConcurrently(
    view => lift(view, 'First'),
    view => view.dispatch(view.state.tr.insertText('!!', findText(view, 'Second') + 6)),
  )

  assert.isTrue(
    doc.eq(
      listSchema.node('doc', null, [
        paragraph('Intro'),
        paragraph('First'),
        list('Second!!'),
        paragraph('After'),
      ]),
    ),
    doc.toString(),
  )
})

it('does not duplicate an item lifted while another item is lifted out of the same list', () => {
  const doc = editConcurrently(
    view => lift(view, 'First'),
    view => lift(view, 'Second'),
  )

  assert.equal(doc.textContent, 'IntroFirstSecondAfter', doc.toString())
})

it('keeps the list element when its first item is lifted out', () => {
  const doc = new Y.Doc()
  const view = createTestView(doc, listSchema)
  try {
    view.dispatch(
      view.state.tr.replaceWith(0, view.state.doc.content.size, [
        paragraph('Intro'),
        list('First', 'Second'),
        paragraph('After'),
      ]),
    )
    const listElement = doc.getXmlFragment('prosemirror').get(1)

    lift(view, 'First')

    assert.strictEqual(doc.getXmlFragment('prosemirror').get(2), listElement)
  } finally {
    view.destroy()
  }
})

it('keeps concurrent typing in a nested list when the item before it is lifted out', () => {
  const firstDoc = new Y.Doc()
  const secondDoc = new Y.Doc()
  const first = createTestView(firstDoc, listSchema)
  const second = createTestView(secondDoc, listSchema)
  try {
    first.dispatch(
      first.state.tr.replaceWith(0, first.state.doc.content.size, [
        paragraph('Intro'),
        list('First', item('Second', list('Sub'))),
        paragraph('After'),
      ]),
    )
    syncDocuments(firstDoc, secondDoc)
    lift(first, 'First')
    second.dispatch(second.state.tr.insertText('!!', findText(second, 'Sub') + 3))
    syncDocuments(firstDoc, secondDoc)

    const expected = listSchema.node('doc', null, [
      paragraph('Intro'),
      paragraph('First'),
      list(item('Second', list('Sub!!'))),
      paragraph('After'),
    ])
    assert.isTrue(first.state.doc.eq(expected), first.state.doc.toString())
    assert.isTrue(second.state.doc.eq(expected), second.state.doc.toString())
  } finally {
    first.destroy()
    second.destroy()
  }
})
