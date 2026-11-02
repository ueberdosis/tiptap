import { Schema } from 'prosemirror-model'
import { EditorState, NodeSelection } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import {
  absolutePositionToRelativePosition,
  relativePositionToAbsolutePosition,
  ySyncPlugin,
  ySyncPluginKey,
  yUndoPlugin,
  yUndoPluginKey,
  undo,
  redo,
} from '@tiptap/y-tiptap'
import { afterEach, describe, expect, it } from 'vite-plus/test'
import * as Y from 'yjs'

const schema = new Schema({
  nodes: {
    doc: { content: 'block+' },
    paragraph: {
      group: 'block',
      content: 'inline*',
      attrs: { align: { default: null } },
      toDOM: () => ['p', 0],
    },
    image: { group: 'block', atom: true, attrs: { src: {} }, toDOM: node => ['img', node.attrs] },
    mention: { group: 'inline', inline: true, atom: true, toDOM: () => ['span', '@user'] },
    bulletList: { group: 'block', content: 'listItem+', toDOM: () => ['ul', 0] },
    listItem: { content: 'paragraph block*', toDOM: () => ['li', 0] },
    text: { group: 'inline' },
  },
  marks: {
    bold: { toDOM: () => ['strong', 0] },
  },
})

const paragraph = (text: string) => schema.node('paragraph', null, schema.text(text))
const text = 'Select some text'

describe('relative positions through structural changes', () => {
  const documents: Y.Doc[] = []
  const views: EditorView[] = []

  afterEach(() => {
    views.forEach(view => view.destroy())
    documents.forEach(document => document.destroy())
    views.length = 0
    documents.length = 0
  })

  const createClient = (withUndo = false) => {
    const document = new Y.Doc()
    documents.push(document)
    const fragment = document.getXmlFragment('prosemirror')
    const view = new EditorView(null, {
      state: EditorState.create({
        schema,
        plugins: [ySyncPlugin(fragment), ...(withUndo ? [yUndoPlugin()] : [])],
      }),
    })
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

  it.each(['image', 'empty paragraph', 'mention'])('follows a moved %s on both clients', kind => {
    const first = createClient()
    const moved =
      kind === 'image'
        ? schema.node('image', { src: 'example.png' })
        : schema.node('paragraph', null, kind === 'mention' ? schema.node('mention') : undefined)
    first.view.dispatch(
      first.view.state.tr.replaceWith(0, first.view.state.doc.content.size, [
        paragraph('Before'),
        moved,
        paragraph('After'),
      ]),
    )
    const second = createClient()
    Y.applyUpdate(second.document, Y.encodeStateAsUpdate(first.document))
    const binding = ySyncPluginKey.getState(first.view.state)!.binding
    const start = first.view.state.doc.child(0).nodeSize
    const anchor = start + (kind === 'image' ? 0 : 1)
    const encoded = Y.encodeRelativePosition(
      absolutePositionToRelativePosition(anchor, first.fragment, binding.mapping),
    )
    const node = first.view.state.doc.child(1)
    const target = first.view.state.doc.content.size - node.nodeSize
    first.view.dispatch(
      first.view.state.tr.delete(start, start + node.nodeSize).insert(target, node),
    )
    Y.applyUpdate(second.document, Y.encodeStateAsUpdate(first.document))

    expect(second.view.state.doc.toJSON()).toEqual(first.view.state.doc.toJSON())
    expect([first, second].map(client => resolvePosition(client, encoded))).toEqual([
      target + anchor - start,
      target + anchor - start,
    ])
  })

  it.each(['image', 'empty paragraph'])(
    'restores a moved %s through undo, redo and reload',
    kind => {
      const first = createClient(true)
      const node =
        kind === 'image' ? schema.node('image', { src: 'example.png' }) : schema.node('paragraph')
      first.view.dispatch(
        first.view.state.tr.replaceWith(0, first.view.state.doc.content.size, [
          paragraph('Before'),
          node,
          paragraph('After'),
        ]),
      )
      const second = createClient()
      Y.applyUpdate(second.document, Y.encodeStateAsUpdate(first.document))
      const binding = ySyncPluginKey.getState(first.view.state)!.binding
      const start = first.view.state.doc.child(0).nodeSize
      const anchor = start + (kind === 'image' ? 0 : 1)
      const encoded = Y.encodeRelativePosition(
        absolutePositionToRelativePosition(anchor, first.fragment, binding.mapping),
      )
      const moved = first.view.state.doc.child(1)
      const target = first.view.state.doc.content.size - moved.nodeSize
      yUndoPluginKey.getState(first.view.state)!.undoManager.stopCapturing()
      first.view.dispatch(
        first.view.state.tr.delete(start, start + moved.nodeSize).insert(target, moved),
      )
      undo(first.view.state)
      Y.applyUpdate(second.document, Y.encodeStateAsUpdate(first.document))
      expect([first, second].map(client => resolvePosition(client, encoded))).toEqual([
        anchor,
        anchor,
      ])

      redo(first.view.state)
      Y.applyUpdate(second.document, Y.encodeStateAsUpdate(first.document))
      const reloaded = createClient()
      Y.applyUpdate(reloaded.document, Y.encodeStateAsUpdate(first.document))
      expect([first, second, reloaded].map(client => resolvePosition(client, encoded))).toEqual([
        target + anchor - start,
        target + anchor - start,
        target + anchor - start,
      ])
      expect(second.view.state.doc.toJSON()).toEqual(first.view.state.doc.toJSON())
      expect(reloaded.view.state.doc.toJSON()).toEqual(first.view.state.doc.toJSON())
    },
  )

  it.each(['before', 'after'])('follows the native boundary %s a moved image', boundary => {
    const first = createClient()
    first.view.dispatch(
      first.view.state.tr.replaceWith(0, first.view.state.doc.content.size, [
        paragraph('Before'),
        schema.node('image', { src: 'example.png' }),
        paragraph('After'),
      ]),
    )
    const encoded = Y.encodeRelativePosition(
      Y.createRelativePositionFromTypeIndex(
        first.fragment,
        boundary === 'before' ? 1 : 2,
        boundary === 'before' ? 0 : -1,
      ),
    )
    const start = first.view.state.doc.child(0).nodeSize
    const moved = first.view.state.doc.child(1)
    const target = first.view.state.doc.content.size - moved.nodeSize
    first.view.dispatch(
      first.view.state.tr.delete(start, start + moved.nodeSize).insert(target, moved),
    )
    const second = createClient()
    Y.applyUpdate(second.document, Y.encodeStateAsUpdate(first.document))
    const expected = target + (boundary === 'after' ? 1 : 0)

    expect([first, second].map(client => resolvePosition(client, encoded))).toEqual([
      expected,
      expected,
    ])
  })

  it('keeps the original image anchor when copying an identical node before it', () => {
    const first = createClient()
    first.view.dispatch(
      first.view.state.tr.replaceWith(0, first.view.state.doc.content.size, [
        paragraph('Before'),
        schema.node('image', { src: 'example.png' }),
        paragraph('After'),
      ]),
    )
    const start = first.view.state.doc.child(0).nodeSize
    const binding = ySyncPluginKey.getState(first.view.state)!.binding
    const encoded = Y.encodeRelativePosition(
      absolutePositionToRelativePosition(start, first.fragment, binding.mapping),
    )
    first.view.dispatch(first.view.state.tr.insert(start, first.view.state.doc.child(1)))
    const second = createClient()
    Y.applyUpdate(second.document, Y.encodeStateAsUpdate(first.document))

    expect([first, second].map(client => resolvePosition(client, encoded))).toEqual([
      start + 1,
      start + 1,
    ])
    const copy = Y.encodeRelativePosition(
      absolutePositionToRelativePosition(start, first.fragment, binding.mapping),
    )
    expect(resolvePosition(first, copy)).toBe(start)
  })

  it.each(['image', 'empty paragraph'])(
    'does not attach a deleted %s to an identical remaining node',
    kind => {
      const first = createClient()
      const node =
        kind === 'image' ? schema.node('image', { src: 'example.png' }) : schema.node('paragraph')
      first.view.dispatch(
        first.view.state.tr.replaceWith(0, first.view.state.doc.content.size, [
          paragraph('Before'),
          node,
          node,
        ]),
      )
      const start = first.view.state.doc.child(0).nodeSize
      const binding = ySyncPluginKey.getState(first.view.state)!.binding
      const encoded = Y.encodeRelativePosition(
        absolutePositionToRelativePosition(
          start + (kind === 'image' ? 0 : 1),
          first.fragment,
          binding.mapping,
        ),
      )
      first.view.dispatch(first.view.state.tr.delete(start, start + node.nodeSize))
      const second = createClient()
      Y.applyUpdate(second.document, Y.encodeStateAsUpdate(first.document))

      expect([first, second].map(client => resolvePosition(client, encoded))).toEqual([null, null])
    },
  )

  it('moves an empty paragraph that retains an empty Y.XmlText', () => {
    const first = createClient(true)
    first.view.dispatch(
      first.view.state.tr.replaceWith(0, first.view.state.doc.content.size, [
        paragraph('Old'),
        paragraph('After'),
      ]),
    )
    first.view.dispatch(first.view.state.tr.delete(1, 4))
    const binding = ySyncPluginKey.getState(first.view.state)!.binding
    const encoded = Y.encodeRelativePosition(
      absolutePositionToRelativePosition(1, first.fragment, binding.mapping),
    )
    const moved = first.view.state.doc.child(0)
    const target = first.view.state.doc.content.size - moved.nodeSize
    yUndoPluginKey.getState(first.view.state)!.undoManager.stopCapturing()
    first.view.dispatch(first.view.state.tr.delete(0, moved.nodeSize).insert(target, moved))
    const second = createClient()
    Y.applyUpdate(second.document, Y.encodeStateAsUpdate(first.document))

    expect([first, second].map(client => resolvePosition(client, encoded))).toEqual([
      target + 1,
      target + 1,
    ])
    undo(first.view.state)
    Y.applyUpdate(second.document, Y.encodeStateAsUpdate(first.document))
    expect([first, second].map(client => resolvePosition(client, encoded))).toEqual([1, 1])
    redo(first.view.state)
    Y.applyUpdate(second.document, Y.encodeStateAsUpdate(first.document))
    expect([first, second].map(client => resolvePosition(client, encoded))).toEqual([
      target + 1,
      target + 1,
    ])
  })

  it('follows an image into a different XML parent and back through undo', () => {
    const first = createClient(true)
    const list = schema.node('bulletList', null, [
      schema.node('listItem', null, paragraph('After')),
    ])
    first.view.dispatch(
      first.view.state.tr.replaceWith(0, first.view.state.doc.content.size, [
        paragraph('Before'),
        schema.node('image', { src: 'example.png' }),
        list,
      ]),
    )
    const start = first.view.state.doc.child(0).nodeSize
    const binding = ySyncPluginKey.getState(first.view.state)!.binding
    const encoded = Y.encodeRelativePosition(
      absolutePositionToRelativePosition(start, first.fragment, binding.mapping),
    )
    const moved = first.view.state.doc.child(1)
    const transaction = first.view.state.tr.delete(start, start + moved.nodeSize)
    const target = transaction.doc.content.size - 2
    yUndoPluginKey.getState(first.view.state)!.undoManager.stopCapturing()
    first.view.dispatch(transaction.insert(target, moved))
    const second = createClient()
    Y.applyUpdate(second.document, Y.encodeStateAsUpdate(first.document))

    expect([first, second].map(client => resolvePosition(client, encoded))).toEqual([
      target,
      target,
    ])
    undo(first.view.state)
    Y.applyUpdate(second.document, Y.encodeStateAsUpdate(first.document))
    expect([first, second].map(client => resolvePosition(client, encoded))).toEqual([start, start])
    expect(second.view.state.doc.toJSON()).toEqual(first.view.state.doc.toJSON())
  })

  it('preserves a remote node selection when the selected image moves', () => {
    const first = createClient()
    first.view.dispatch(
      first.view.state.tr.replaceWith(0, first.view.state.doc.content.size, [
        paragraph('Before'),
        schema.node('image', { src: 'example.png' }),
        paragraph('After'),
      ]),
    )
    const second = createClient()
    Y.applyUpdate(second.document, Y.encodeStateAsUpdate(first.document))
    const start = first.view.state.doc.child(0).nodeSize
    second.view.dispatch(
      second.view.state.tr.setSelection(NodeSelection.create(second.view.state.doc, start)),
    )
    const moved = first.view.state.doc.child(1)
    const target = first.view.state.doc.content.size - moved.nodeSize
    first.view.dispatch(
      first.view.state.tr.delete(start, start + moved.nodeSize).insert(target, moved),
    )
    Y.applyUpdate(second.document, Y.encodeStateAsUpdate(first.document))

    expect(second.view.state.selection.toJSON()).toEqual({ type: 'node', anchor: target })
  })

  it('follows an inline atom into a split paragraph', () => {
    const first = createClient()
    first.view.dispatch(
      first.view.state.tr.replaceWith(
        0,
        first.view.state.doc.content.size,
        schema.node('paragraph', null, [
          schema.text('Before'),
          schema.node('mention'),
          schema.text('After'),
        ]),
      ),
    )
    const element = first.fragment.get(0)

    if (!(element instanceof Y.XmlElement)) {
      throw new Error('Missing paragraph')
    }

    const encoded = Y.encodeRelativePosition(Y.createRelativePositionFromTypeIndex(element, 1, 0))
    const transaction = first.view.state.tr.split(4)
    const expected = transaction.mapping.map(7, 1)
    first.view.dispatch(transaction)
    const second = createClient()
    Y.applyUpdate(second.document, Y.encodeStateAsUpdate(first.document))

    expect([first, second].map(client => resolvePosition(client, encoded))).toEqual([
      expected,
      expected,
    ])
  })

  it('returns null for conflicting concurrent image moves', () => {
    const first = createClient()
    first.view.dispatch(
      first.view.state.tr.replaceWith(0, first.view.state.doc.content.size, [
        paragraph('Before'),
        schema.node('image', { src: 'example.png' }),
        paragraph('After'),
      ]),
    )
    const second = createClient()
    Y.applyUpdate(second.document, Y.encodeStateAsUpdate(first.document))
    const start = first.view.state.doc.child(0).nodeSize
    const encoded = Y.encodeRelativePosition(
      Y.createRelativePositionFromTypeIndex(first.fragment, 1),
    )
    const moved = first.view.state.doc.child(1)
    const before = first.view.state.doc.child(0)
    first.view.dispatch(
      first.view.state.tr
        .delete(start, start + moved.nodeSize)
        .replaceWith(
          0,
          before.nodeSize,
          schema.node('bulletList', null, schema.node('listItem', null, [before, moved])),
        ),
    )
    const other = second.view.state.doc.child(1)
    const after = second.view.state.doc.child(2)
    second.view.dispatch(
      second.view.state.tr
        .delete(start, start + other.nodeSize)
        .replaceWith(
          start,
          start + after.nodeSize,
          schema.node('bulletList', null, schema.node('listItem', null, [after, other])),
        ),
    )
    const firstUpdate = Y.encodeStateAsUpdate(first.document)
    const secondUpdate = Y.encodeStateAsUpdate(second.document)
    Y.applyUpdate(first.document, secondUpdate)
    Y.applyUpdate(second.document, firstUpdate)

    expect(second.view.state.doc.toJSON()).toEqual(first.view.state.doc.toJSON())
    expect([first, second].map(client => resolvePosition(client, encoded))).toEqual([null, null])
  })

  it.each(['image', 'paragraph'])('keeps a %s anchor through an attribute update', kind => {
    const first = createClient()
    const node =
      kind === 'image' ? schema.node('image', { src: 'before.png' }) : schema.node('paragraph')
    first.view.dispatch(
      first.view.state.tr.replaceWith(0, first.view.state.doc.content.size, [
        paragraph('Before'),
        node,
      ]),
    )
    const start = first.view.state.doc.child(0).nodeSize
    const anchor = start + (kind === 'paragraph' ? 1 : 0)
    const binding = ySyncPluginKey.getState(first.view.state)!.binding
    const encoded = Y.encodeRelativePosition(
      absolutePositionToRelativePosition(anchor, first.fragment, binding.mapping),
    )
    first.view.dispatch(
      first.view.state.tr.setNodeMarkup(
        start,
        undefined,
        kind === 'image' ? { src: 'after.png' } : { align: 'center' },
      ),
    )
    const second = createClient()
    Y.applyUpdate(second.document, Y.encodeStateAsUpdate(first.document))

    expect([first, second].map(client => resolvePosition(client, encoded))).toEqual([
      anchor,
      anchor,
    ])
  })

  it.each([
    { name: 'paragraph split before the anchored text', split: 8, anchor: 13 },
    { name: 'paragraph split inside the anchored text', split: 14, anchor: 15 },
    { name: 'paragraph split after the anchored text', split: 15, anchor: 8 },
  ])('$name', ({ split, anchor }) => {
    const first = createClient()
    first.view.dispatch(
      first.view.state.tr.replaceWith(0, first.view.state.doc.content.size, paragraph(text)),
    )
    const second = createClient()
    Y.applyUpdate(second.document, Y.encodeStateAsUpdate(first.document))
    const binding = ySyncPluginKey.getState(first.view.state)?.binding

    if (!binding) {
      throw new Error('Missing sync binding')
    }

    const encoded = Y.encodeRelativePosition(
      absolutePositionToRelativePosition(anchor, first.fragment, binding.mapping),
    )
    const transaction = first.view.state.tr.split(split)
    const expectedPosition = transaction.mapping.map(anchor, 1)
    first.view.dispatch(transaction)
    Y.applyUpdate(second.document, Y.encodeStateAsUpdate(first.document))

    expect(second.view.state.doc.toJSON()).toEqual(first.view.state.doc.toJSON())

    expect([first, second].map(client => resolvePosition(client, encoded))).toEqual([
      expectedPosition,
      expectedPosition,
    ])
  })

  it('follows the text into a split list item on both clients', () => {
    const first = createClient()
    const list = schema.node('bulletList', null, [schema.node('listItem', null, [paragraph(text)])])
    first.view.dispatch(first.view.state.tr.replaceWith(0, first.view.state.doc.content.size, list))
    const second = createClient()
    Y.applyUpdate(second.document, Y.encodeStateAsUpdate(first.document))
    const binding = ySyncPluginKey.getState(first.view.state)?.binding

    if (!binding) {
      throw new Error('Missing sync binding')
    }

    const anchor = 15
    const encoded = Y.encodeRelativePosition(
      absolutePositionToRelativePosition(anchor, first.fragment, binding.mapping),
    )
    const transaction = first.view.state.tr.split(10, 2)
    const expectedPosition = transaction.mapping.map(anchor, 1)
    first.view.dispatch(transaction)
    Y.applyUpdate(second.document, Y.encodeStateAsUpdate(first.document))

    expect(second.view.state.doc.toJSON()).toEqual(first.view.state.doc.toJSON())

    expect([first, second].map(client => resolvePosition(client, encoded))).toEqual([
      expectedPosition,
      expectedPosition,
    ])
  })

  it.each([1, 13, 17])(
    'follows position %i in a paragraph moved to the end on both clients',
    anchor => {
      const first = createClient()
      const blocks = [paragraph(text), paragraph('Another block'), paragraph('Final block')]
      first.view.dispatch(
        first.view.state.tr.replaceWith(0, first.view.state.doc.content.size, blocks),
      )
      const second = createClient()
      Y.applyUpdate(second.document, Y.encodeStateAsUpdate(first.document))
      const binding = ySyncPluginKey.getState(first.view.state)?.binding

      if (!binding) {
        throw new Error('Missing sync binding')
      }

      const encoded = Y.encodeRelativePosition(
        absolutePositionToRelativePosition(anchor, first.fragment, binding.mapping),
      )
      const moved = first.view.state.doc.child(0)
      const target = first.view.state.doc.content.size - moved.nodeSize
      const transaction = first.view.state.tr.delete(0, moved.nodeSize).insert(target, moved)
      first.view.dispatch(transaction)
      Y.applyUpdate(second.document, Y.encodeStateAsUpdate(first.document))

      expect(second.view.state.doc.toJSON()).toEqual(first.view.state.doc.toJSON())

      expect([first, second].map(client => resolvePosition(client, encoded))).toEqual([
        target + anchor,
        target + anchor,
      ])
    },
  )

  it.each([0, 16])(
    'follows a native right-associated boundary at index %i during a move',
    index => {
      const first = createClient()
      first.view.dispatch(
        first.view.state.tr.replaceWith(0, first.view.state.doc.content.size, [
          paragraph(text),
          paragraph('Another block'),
        ]),
      )
      const element = first.fragment.get(0)

      if (!(element instanceof Y.XmlElement)) {
        throw new Error('Missing paragraph')
      }

      const type = element.get(0)

      if (!(type instanceof Y.XmlText)) {
        throw new Error('Missing paragraph text')
      }

      const encoded = Y.encodeRelativePosition(
        Y.createRelativePositionFromTypeIndex(type, index, 0),
      )
      const moved = first.view.state.doc.child(0)
      const target = first.view.state.doc.content.size - moved.nodeSize
      first.view.dispatch(first.view.state.tr.delete(0, moved.nodeSize).insert(target, moved))
      const second = createClient()
      Y.applyUpdate(second.document, Y.encodeStateAsUpdate(first.document))

      expect([first, second].map(client => resolvePosition(client, encoded))).toEqual([
        target + index + 1,
        target + index + 1,
      ])
    },
  )

  it('resolves an offline position through repeated splits after binary reload', () => {
    const first = createClient()
    first.view.dispatch(
      first.view.state.tr.replaceWith(0, first.view.state.doc.content.size, paragraph(text)),
    )
    const offline = createClient()
    Y.applyUpdate(offline.document, Y.encodeStateAsUpdate(first.document))
    const binding = ySyncPluginKey.getState(offline.view.state)?.binding

    if (!binding) {
      throw new Error('Missing sync binding')
    }

    const encoded = Y.encodeRelativePosition(
      absolutePositionToRelativePosition(13, offline.fragment, binding.mapping),
    )
    first.view.dispatch(first.view.state.tr.split(8))
    first.view.dispatch(first.view.state.tr.split(12))
    const reloaded = createClient()
    Y.applyUpdate(reloaded.document, Y.encodeStateAsUpdate(first.document))
    Y.applyUpdate(offline.document, Y.encodeStateAsUpdate(first.document))

    expect([first, offline, reloaded].map(client => resolvePosition(client, encoded))).toEqual([
      17, 17, 17,
    ])
  })

  it('keeps the original position when copying a paragraph', () => {
    const first = createClient()
    first.view.dispatch(
      first.view.state.tr.replaceWith(0, first.view.state.doc.content.size, paragraph(text)),
    )
    const binding = ySyncPluginKey.getState(first.view.state)?.binding

    if (!binding) {
      throw new Error('Missing sync binding')
    }

    const encoded = Y.encodeRelativePosition(
      absolutePositionToRelativePosition(13, first.fragment, binding.mapping),
    )
    first.view.dispatch(
      first.view.state.tr.insert(first.view.state.doc.content.size, first.view.state.doc.child(0)),
    )

    expect(resolvePosition(first, encoded)).toBe(13)
  })

  it('preserves the position through split undo and redo on both clients', () => {
    const first = createClient(true)
    first.view.dispatch(
      first.view.state.tr.replaceWith(0, first.view.state.doc.content.size, paragraph(text)),
    )
    const second = createClient()
    Y.applyUpdate(second.document, Y.encodeStateAsUpdate(first.document))
    const binding = ySyncPluginKey.getState(first.view.state)?.binding

    if (!binding) {
      throw new Error('Missing sync binding')
    }

    const encoded = Y.encodeRelativePosition(
      absolutePositionToRelativePosition(13, first.fragment, binding.mapping),
    )
    yUndoPluginKey.getState(first.view.state)?.undoManager.stopCapturing()
    first.view.dispatch(first.view.state.tr.split(8))
    undo(first.view.state)
    Y.applyUpdate(second.document, Y.encodeStateAsUpdate(first.document))

    expect(second.view.state.doc.toJSON()).toEqual(first.view.state.doc.toJSON())
    expect([first, second].map(client => resolvePosition(client, encoded))).toEqual([13, 13])

    redo(first.view.state)
    Y.applyUpdate(second.document, Y.encodeStateAsUpdate(first.document))

    expect(second.view.state.doc.toJSON()).toEqual(first.view.state.doc.toJSON())
    expect([first, second].map(client => resolvePosition(client, encoded))).toEqual([15, 15])
  })

  it('follows text when paragraphs are joined', () => {
    const first = createClient()
    first.view.dispatch(
      first.view.state.tr.replaceWith(0, first.view.state.doc.content.size, [
        paragraph('First'),
        paragraph(text),
      ]),
    )
    const binding = ySyncPluginKey.getState(first.view.state)?.binding

    if (!binding) {
      throw new Error('Missing sync binding')
    }

    const anchor = 20
    const encoded = Y.encodeRelativePosition(
      absolutePositionToRelativePosition(anchor, first.fragment, binding.mapping),
    )
    const transaction = first.view.state.tr.join(7)
    const expected = transaction.mapping.map(anchor, -1)
    first.view.dispatch(transaction)
    const second = createClient()
    Y.applyUpdate(second.document, Y.encodeStateAsUpdate(first.document))

    expect([first, second].map(client => resolvePosition(client, encoded))).toEqual([
      expected,
      expected,
    ])
  })

  it('does not attach deleted text to an identical remaining paragraph', () => {
    const first = createClient()
    const sharedNode = paragraph(text)
    first.view.dispatch(
      first.view.state.tr.replaceWith(0, first.view.state.doc.content.size, [
        sharedNode,
        sharedNode,
      ]),
    )
    const binding = ySyncPluginKey.getState(first.view.state)?.binding

    if (!binding) {
      throw new Error('Missing sync binding')
    }

    const encoded = Y.encodeRelativePosition(
      absolutePositionToRelativePosition(13, first.fragment, binding.mapping),
    )
    first.view.dispatch(first.view.state.tr.delete(0, sharedNode.nodeSize))
    const second = createClient()
    Y.applyUpdate(second.document, Y.encodeStateAsUpdate(first.document))

    expect([first, second].map(client => resolvePosition(client, encoded))).toEqual([null, null])
  })

  it.each([
    { name: 'text', scope: 'text', offset: 12, assoc: -1, expected: 15 },
    { name: 'text start', scope: 'text', offset: 0, assoc: -1, expected: 1 },
    { name: 'text end', scope: 'text', offset: text.length, assoc: 0, expected: text.length + 3 },
    { name: 'node', scope: 'fragment', offset: 0, assoc: 0, expected: 0 },
    { name: 'node start', scope: 'node', offset: 0, assoc: -1, expected: 1 },
    { name: 'node end', scope: 'node', offset: 1, assoc: 0, expected: text.length + 3 },
  ] as const)(
    'preserves $name anchors through concurrent splits in different paragraphs',
    ({ scope, offset, assoc, expected }) => {
      const first = createClient()
      first.view.dispatch(
        first.view.state.tr.replaceWith(0, first.view.state.doc.content.size, [
          paragraph(text),
          paragraph(text),
        ]),
      )
      const second = createClient()
      Y.applyUpdate(second.document, Y.encodeStateAsUpdate(first.document))
      const paragraphSize = first.view.state.doc.child(0).nodeSize
      const anchors = first.fragment.toArray().map((element, index) => {
        if (!(element instanceof Y.XmlElement)) {
          throw new Error('Expected a paragraph element')
        }

        const paragraphElement = element
        const sharedText = paragraphElement.get(0)

        if (!(sharedText instanceof Y.XmlText)) {
          throw new Error('Expected paragraph text')
        }
        const types = { text: sharedText, node: paragraphElement, fragment: first.fragment }
        const type = types[scope]
        const position = Y.createRelativePositionFromTypeIndex(
          type,
          scope === 'fragment' ? index : offset,
          assoc,
        )

        return Y.encodeRelativePosition(position)
      })

      first.view.dispatch(first.view.state.tr.split(8))
      second.view.dispatch(second.view.state.tr.split(paragraphSize + 8))
      expect(resolvePosition(first, anchors[0])).toBe(expected)
      expect(resolvePosition(second, anchors[1])).toBe(paragraphSize + expected)
      const firstUpdate = Y.encodeStateAsUpdate(first.document)
      const secondUpdate = Y.encodeStateAsUpdate(second.document)
      Y.applyUpdate(first.document, secondUpdate)
      Y.applyUpdate(second.document, firstUpdate)

      expect(second.view.state.doc.toJSON()).toEqual(first.view.state.doc.toJSON())
      for (const client of [first, second]) {
        expect(anchors.map(anchor => resolvePosition(client, anchor))).toEqual([
          expected,
          paragraphSize + expected + 2,
        ])
      }
    },
  )

  it('returns null for conflicting concurrent structural destinations', () => {
    const first = createClient()
    first.view.dispatch(
      first.view.state.tr.replaceWith(0, first.view.state.doc.content.size, paragraph(text)),
    )
    const second = createClient()
    Y.applyUpdate(second.document, Y.encodeStateAsUpdate(first.document))
    const binding = ySyncPluginKey.getState(first.view.state)?.binding

    if (!binding) {
      throw new Error('Missing sync binding')
    }

    const encoded = Y.encodeRelativePosition(
      absolutePositionToRelativePosition(13, first.fragment, binding.mapping),
    )
    first.view.dispatch(first.view.state.tr.split(8))
    second.view.dispatch(second.view.state.tr.split(10))
    const firstUpdate = Y.encodeStateAsUpdate(first.document)
    const secondUpdate = Y.encodeStateAsUpdate(second.document)
    Y.applyUpdate(first.document, secondUpdate)
    Y.applyUpdate(second.document, firstUpdate)

    expect(second.view.state.doc.toJSON()).toEqual(first.view.state.doc.toJSON())
    expect([first, second].map(client => resolvePosition(client, encoded))).toEqual([null, null])
  })

  it('maps appended typing before the split is flushed to Yjs', () => {
    const first = createClient()
    first.view.dispatch(
      first.view.state.tr.replaceWith(0, first.view.state.doc.content.size, paragraph(text)),
    )
    const binding = ySyncPluginKey.getState(first.view.state)?.binding

    if (!binding) {
      throw new Error('Missing sync binding')
    }

    const encoded = Y.encodeRelativePosition(
      absolutePositionToRelativePosition(13, first.fragment, binding.mapping),
    )
    const splitState = first.view.state.apply(first.view.state.tr.split(8))
    first.view.updateState(splitState.apply(splitState.tr.insertText('new ', 10)))
    const second = createClient()
    Y.applyUpdate(second.document, Y.encodeStateAsUpdate(first.document))

    expect([first, second].map(client => resolvePosition(client, encoded))).toEqual([19, 19])
  })

  it.each([
    { name: 'insert', from: 1, to: 1, inserted: 'new ', expected: 17 },
    { name: 'delete', from: 1, to: 5, inserted: '', expected: 9 },
    { name: 'replace', from: 1, to: 5, inserted: 'X', expected: 10 },
  ])(
    'maps a text $name before appended paragraph normalization',
    ({ from, to, inserted, expected }) => {
      const first = createClient()
      first.view.dispatch(
        first.view.state.tr.replaceWith(0, first.view.state.doc.content.size, paragraph(text)),
      )
      const binding = ySyncPluginKey.getState(first.view.state)!.binding
      const encoded = Y.encodeRelativePosition(
        absolutePositionToRelativePosition(13, first.fragment, binding.mapping),
      )
      const typedState = first.view.state.apply(first.view.state.tr.insertText(inserted, from, to))
      first.view.updateState(
        typedState.apply(typedState.tr.setNodeMarkup(0, undefined, { align: 'center' })),
      )
      const second = createClient()
      Y.applyUpdate(second.document, Y.encodeStateAsUpdate(first.document))

      expect(first.view.state.doc.firstChild!.attrs.align).toBe('center')
      expect(first.view.state.doc.textContent).toBe(
        text.slice(0, from - 1) + inserted + text.slice(to - 1),
      )
      expect(second.view.state.doc.toJSON()).toEqual(first.view.state.doc.toJSON())
      expect([first, second].map(client => resolvePosition(client, encoded))).toEqual([
        expected,
        expected,
      ])
    },
  )

  it('preserves anchors through typing and appended marks on both clients', () => {
    const first = createClient()
    first.view.dispatch(
      first.view.state.tr.replaceWith(0, first.view.state.doc.content.size, paragraph(text)),
    )
    const binding = ySyncPluginKey.getState(first.view.state)!.binding
    const encoded = Y.encodeRelativePosition(
      absolutePositionToRelativePosition(13, first.fragment, binding.mapping),
    )
    const typedState = first.view.state.apply(first.view.state.tr.insertText('new ', 1))
    first.view.updateState(
      typedState.apply(typedState.tr.addMark(1, 5, schema.marks.bold.create())),
    )
    const second = createClient()
    Y.applyUpdate(second.document, Y.encodeStateAsUpdate(first.document))

    expect(first.view.state.doc.textContent).toBe(`new ${text}`)
    expect(second.view.state.doc.toJSON()).toEqual(first.view.state.doc.toJSON())
    expect([first, second].map(client => resolvePosition(client, encoded))).toEqual([17, 17])
  })

  it('maps consecutive text and mark transactions before an appended split', () => {
    const first = createClient()
    first.view.dispatch(
      first.view.state.tr.replaceWith(0, first.view.state.doc.content.size, paragraph(text)),
    )
    const binding = ySyncPluginKey.getState(first.view.state)!.binding
    const encoded = Y.encodeRelativePosition(
      absolutePositionToRelativePosition(13, first.fragment, binding.mapping),
    )
    let pending = first.view.state.apply(first.view.state.tr.insertText('new ', 1))
    pending = pending.apply(pending.tr.insertText('more ', 1))
    pending = pending.apply(pending.tr.addMark(1, 10, schema.marks.bold.create()))
    first.view.updateState(pending.apply(pending.tr.split(8)))
    const second = createClient()
    Y.applyUpdate(second.document, Y.encodeStateAsUpdate(first.document))

    expect(first.view.state.doc.textContent).toBe(`more new ${text}`)
    expect(second.view.state.doc.toJSON()).toEqual(first.view.state.doc.toJSON())
    expect([first, second].map(client => resolvePosition(client, encoded))).toEqual([24, 24])
  })

  it('does not replay text that was already synchronized before a split', () => {
    const first = createClient()
    first.view.dispatch(
      first.view.state.tr.replaceWith(0, first.view.state.doc.content.size, paragraph(text)),
    )
    const binding = ySyncPluginKey.getState(first.view.state)!.binding
    const encoded = Y.encodeRelativePosition(
      absolutePositionToRelativePosition(13, first.fragment, binding.mapping),
    )

    first.view.dispatch(first.view.state.tr.insertText('new ', 1))
    first.view.dispatch(first.view.state.tr.split(8))
    const second = createClient()
    Y.applyUpdate(second.document, Y.encodeStateAsUpdate(first.document))

    expect(second.view.state.doc.toJSON()).toEqual(first.view.state.doc.toJSON())
    expect([first, second].map(client => resolvePosition(client, encoded))).toEqual([19, 19])
  })

  it('follows a move and subsequent typing in the same transaction', () => {
    const first = createClient()
    first.view.dispatch(
      first.view.state.tr.replaceWith(0, first.view.state.doc.content.size, [
        paragraph(text),
        paragraph('Another block'),
      ]),
    )
    const binding = ySyncPluginKey.getState(first.view.state)?.binding

    if (!binding) {
      throw new Error('Missing sync binding')
    }

    const encoded = Y.encodeRelativePosition(
      absolutePositionToRelativePosition(13, first.fragment, binding.mapping),
    )
    const moved = first.view.state.doc.child(0)
    const target = first.view.state.doc.content.size - moved.nodeSize
    first.view.dispatch(
      first.view.state.tr
        .delete(0, moved.nodeSize)
        .insert(target, moved)
        .insertText('new ', target + 1),
    )
    const second = createClient()
    Y.applyUpdate(second.document, Y.encodeStateAsUpdate(first.document))

    expect([first, second].map(client => resolvePosition(client, encoded))).toEqual([
      target + 17,
      target + 17,
    ])
  })
})
