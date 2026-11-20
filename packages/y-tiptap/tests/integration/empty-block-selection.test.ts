import { expect, it } from 'vite-plus/test'
import type { Node } from 'prosemirror-model'
import { TextSelection } from 'prosemirror-state'
import * as Y from 'yjs'
import { findAbsolutePositionAfterStructuralChange } from '@tiptap/y-tiptap'
import { createTestView } from '../utils/createTestView.js'
import { schema } from '../utils/testSchema.js'
import { syncDocuments } from '../utils/syncDocuments.js'

const startOfBlock = (doc: Node, index: number) => {
  let pos = 1
  for (let blockIndex = 0; blockIndex < index; blockIndex++) {
    pos += doc.child(blockIndex).nodeSize
  }
  return pos
}

it.each(['insert empty sibling', 'type into caret block'])(
  'keeps the caret in its own empty block when a remote peer does: %s',
  action => {
    const localDoc = new Y.Doc()
    const remoteDoc = new Y.Doc()
    localDoc.clientID = 1
    remoteDoc.clientID = 2
    const local = createTestView(localDoc)
    const remote = createTestView(remoteDoc)
    try {
      const texts = action === 'insert empty sibling' ? ['first', 'second', ''] : ['', '', '']
      const selectedIndex = action === 'insert empty sibling' ? 2 : 1
      local.dispatch(
        local.state.tr.replaceWith(
          0,
          local.state.doc.content.size,
          texts.map(text =>
            schema.node('paragraph', undefined, text ? schema.text(text) : undefined),
          ),
        ),
      )
      syncDocuments(localDoc, remoteDoc)
      local.dispatch(
        local.state.tr.setSelection(
          TextSelection.create(local.state.doc, startOfBlock(local.state.doc, selectedIndex)),
        ),
      )
      if (action === 'insert empty sibling') {
        remote.dispatch(
          remote.state.tr.insert(startOfBlock(remote.state.doc, 2) - 1, schema.node('paragraph')),
        )
      } else {
        remote.dispatch(remote.state.tr.insertText('ab', startOfBlock(remote.state.doc, 1)))
      }
      Y.applyUpdate(localDoc, Y.encodeStateAsUpdate(remoteDoc))
      expect(local.state.doc.eq(remote.state.doc)).toBe(true)
      expect(local.state.selection.$from.index(0)).toBe(action === 'insert empty sibling' ? 3 : 1)
    } finally {
      local.destroy()
      remote.destroy()
      localDoc.destroy()
      remoteDoc.destroy()
    }
  },
)

it('keeps ordinal matching when a nonempty sibling is inserted', () => {
  const empty = schema.node('paragraph')
  const oldDoc = schema.node('doc', undefined, [empty, empty])
  const newDoc = schema.node('doc', undefined, [
    schema.node('paragraph', undefined, schema.text('new')),
    empty,
    empty,
  ])
  expect(findAbsolutePositionAfterStructuralChange(oldDoc, newDoc, 3)).toBe(8)
})
