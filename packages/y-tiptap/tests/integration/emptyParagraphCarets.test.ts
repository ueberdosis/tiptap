import {
  absolutePositionToRelativePosition,
  relativePositionToAbsolutePosition,
  ySyncPluginKey,
} from '@tiptap/y-tiptap'
import { afterEach, describe, expect, it } from 'vite-plus/test'
import * as Y from 'yjs'
import { createTestView } from '../utils/createTestView.js'
import { schema } from '../utils/testSchema.js'

const paragraph = (text: string) => schema.node('paragraph', null, schema.text(text))

describe('carets in split empty paragraphs', () => {
  const documents: Y.Doc[] = []
  const views: ReturnType<typeof createTestView>[] = []

  afterEach(() => {
    views.forEach(view => view.destroy())
    documents.forEach(document => document.destroy())
    views.length = 0
    documents.length = 0
  })

  const createClient = () => {
    const document = new Y.Doc()
    documents.push(document)
    const fragment = document.getXmlFragment('prosemirror')
    const view = createTestView(document)
    views.push(view)

    return { document, fragment, view }
  }

  const resolvePosition = (client: ReturnType<typeof createClient>, encoded: Uint8Array) => {
    const state = ySyncPluginKey.getState(client.view.state)

    if (!state) {
      throw new Error('Missing sync plugin state')
    }

    return relativePositionToAbsolutePosition(
      client.document,
      client.fragment,
      Y.decodeRelativePosition(encoded),
      state.binding.mapping,
    )
  }

  it('keeps a newly placed caret in an empty paragraph after splitting it', () => {
    const first = createClient()
    first.view.dispatch(
      first.view.state.tr.replaceWith(0, first.view.state.doc.content.size, paragraph('Before')),
    )
    const second = createClient()
    Y.applyUpdate(second.document, Y.encodeStateAsUpdate(first.document))

    first.view.dispatch(first.view.state.tr.split(7))
    const binding = ySyncPluginKey.getState(first.view.state)!.binding
    const beforeSplit = Y.encodeRelativePosition(
      absolutePositionToRelativePosition(9, first.fragment, binding.mapping),
    )
    first.view.dispatch(first.view.state.tr.split(9))
    first.view.dispatch(first.view.state.tr.insertText('After gap', 11))
    Y.applyUpdate(second.document, Y.encodeStateAsUpdate(first.document))

    expect(first.view.state.doc.toJSON()).toEqual(
      schema
        .node('doc', null, [paragraph('Before'), schema.node('paragraph'), paragraph('After gap')])
        .toJSON(),
    )
    expect(second.view.state.doc.toJSON()).toEqual(first.view.state.doc.toJSON())

    const encoded = Y.encodeRelativePosition(
      absolutePositionToRelativePosition(9, first.fragment, binding.mapping),
    )

    const reloaded = createClient()
    Y.applyUpdate(reloaded.document, Y.encodeStateAsUpdate(first.document))

    for (const client of [first, second, reloaded]) {
      expect(resolvePosition(client, beforeSplit)).toBe(9)
      expect(resolvePosition(client, encoded)).toBe(9)
      const clientBinding = ySyncPluginKey.getState(client.view.state)!.binding
      const fresh = Y.encodeRelativePosition(
        absolutePositionToRelativePosition(9, client.fragment, clientBinding.mapping),
      )
      expect(resolvePosition(client, fresh)).toBe(9)
    }
  })

  it.each([1, 2])(
    'preserves concurrent typing when client %i splits an empty paragraph',
    clientId => {
      const first = createClient()
      first.document.clientID = clientId
      first.view.dispatch(
        first.view.state.tr.replaceWith(0, first.view.state.doc.content.size, paragraph('Before')),
      )
      first.view.dispatch(first.view.state.tr.split(7))
      const second = createClient()
      second.document.clientID = 3 - clientId
      Y.applyUpdate(second.document, Y.encodeStateAsUpdate(first.document))

      first.view.dispatch(first.view.state.tr.split(9))
      second.view.dispatch(second.view.state.tr.insertText('Concurrent text', 9))
      const firstUpdate = Y.encodeStateAsUpdate(first.document)
      const secondUpdate = Y.encodeStateAsUpdate(second.document)
      Y.applyUpdate(first.document, secondUpdate)
      Y.applyUpdate(second.document, firstUpdate)

      expect(second.view.state.doc.toJSON()).toEqual(first.view.state.doc.toJSON())
      expect(first.view.state.doc.textContent).toBe('BeforeConcurrent text')
      const reloaded = createClient()
      Y.applyUpdate(reloaded.document, Y.encodeStateAsUpdate(first.document))
      expect(reloaded.view.state.doc.toJSON()).toEqual(first.view.state.doc.toJSON())
    },
  )
})
