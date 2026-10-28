import { expect, it } from 'vite-plus/test'
import { Schema } from 'prosemirror-model'
import { TextSelection } from 'prosemirror-state'
import * as Y from 'yjs'
import { createTestView } from '../utils/createTestView.js'
import { schema } from '../utils/testSchema.js'
import { syncDocuments } from '../utils/syncDocuments.js'

const schemaWithBlockIds = new Schema({
  nodes: schema.spec.nodes.update('paragraph', {
    ...schema.spec.nodes.get('paragraph'),
    attrs: { id: { default: null } },
  }),
  marks: schema.spec.marks,
})

it.each([
  { anchor: 12, head: 12, expectedAnchor: 14, expectedHead: 14 },
  { anchor: 12, head: 7, expectedAnchor: 14, expectedHead: 9 },
])(
  'keeps selection $anchor/$head on its text after a remote edit',
  ({ anchor, head, expectedAnchor, expectedHead }) => {
    const localDoc = new Y.Doc()
    const remoteDoc = new Y.Doc()
    localDoc.clientID = 1
    remoteDoc.clientID = 2
    const local = createTestView(localDoc, schemaWithBlockIds)
    const remote = createTestView(remoteDoc, schemaWithBlockIds)
    try {
      local.dispatch(
        local.state.tr.replaceWith(0, local.state.doc.content.size, [
          schemaWithBlockIds.node(
            'paragraph',
            { id: 'one' },
            schemaWithBlockIds.text('Hello world'),
          ),
          schemaWithBlockIds.node(
            'paragraph',
            { id: 'two' },
            schemaWithBlockIds.text('Another line'),
          ),
        ]),
      )
      syncDocuments(localDoc, remoteDoc)
      local.dispatch(
        local.state.tr.setSelection(TextSelection.create(local.state.doc, anchor, head)),
      )
      remote.dispatch(remote.state.tr.insertText('A ', 1))
      syncDocuments(localDoc, remoteDoc)
      expect(local.state.doc.child(0).textContent).toBe('A Hello world')
      expect(local.state.selection.anchor).toBe(expectedAnchor)
      expect(local.state.selection.head).toBe(expectedHead)
    } finally {
      local.destroy()
      remote.destroy()
      localDoc.destroy()
      remoteDoc.destroy()
    }
  },
)
