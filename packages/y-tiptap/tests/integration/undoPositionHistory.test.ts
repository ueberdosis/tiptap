import { EditorState, TextSelection } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import {
  absolutePositionToRelativePosition,
  relativePositionToAbsolutePosition,
  undo,
  ySyncPlugin,
  ySyncPluginKey,
  yUndoPlugin,
  yUndoPluginKey,
} from '@tiptap/y-tiptap'
import { afterEach, describe, expect, it } from 'vite-plus/test'
import * as Y from 'yjs'
import { getPositionMigrationStore } from '../../src/lib/utils/positions/migrations/getPositionMigrationStore.js'
import { schema } from '../utils/testSchema.js'

describe('undo position history', () => {
  const views: EditorView[] = []

  afterEach(() => {
    views.forEach(view => view.destroy())
    views.length = 0
  })

  it('stores restored positions as ranges through repeated split and undo', () => {
    const document = new Y.Doc()
    const fragment = document.getXmlFragment('prosemirror')
    const view = new EditorView(null, {
      state: EditorState.create({ schema, plugins: [ySyncPlugin(fragment), yUndoPlugin()] }),
    })
    views.push(view)
    const content = Array.from({ length: 10 }, (_, index) =>
      schema.node('paragraph', null, schema.text(`Paragraph ${index} has some words in it.`)),
    )
    view.dispatch(view.state.tr.replaceWith(0, view.state.doc.content.size, content))

    const binding = ySyncPluginKey.getState(view.state)!.binding
    const positions = Array.from({ length: view.state.doc.content.size }, (_, position) => position)
    const anchors = positions.map(position =>
      absolutePositionToRelativePosition(position, fragment, binding.mapping),
    )
    const undoManager = yUndoPluginKey.getState(view.state)!.undoManager

    for (let cycle = 0; cycle < 20; cycle += 1) {
      undoManager.stopCapturing()
      view.dispatch(view.state.tr.setSelection(TextSelection.create(view.state.doc, 50)).split(50))
      undoManager.stopCapturing()
      undo(view.state)
    }

    const resolved = anchors.map(anchor =>
      relativePositionToAbsolutePosition(document, fragment, anchor, binding.mapping),
    )
    expect(resolved).toEqual(positions)

    let transfers = 0
    let characters = 0
    getPositionMigrationStore(fragment).forEach(migration =>
      migration.transfers.forEach(transfer => {
        transfers += 1
        characters += transfer.source.length
      }),
    )
    // Restored characters are stored as ranges, not one transfer each.
    expect(transfers).toBeLessThan(characters / 10)
  })
})
