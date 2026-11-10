import { Schema } from 'prosemirror-model'
import type { Node } from 'prosemirror-model'
import { EditorState, TextSelection } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { nodes, marks } from 'prosemirror-schema-basic'
import {
  prosemirrorToYXmlFragment,
  undo,
  yCursorPlugin,
  yCursorPluginKey,
  ySyncPlugin,
  ySyncPluginKey,
  yUndoPlugin,
} from '@tiptap/y-tiptap'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'
import { Awareness, applyAwarenessUpdate, encodeAwarenessUpdate } from 'y-protocols/awareness'
import * as Y from 'yjs'

const richSchema = new Schema({
  nodes: {
    ...nodes,
    secret: { group: 'block', content: 'text*' },
    list: { group: 'block', content: 'item*' },
    item: { content: 'block*' },
  },
  marks: { ...marks, secretMark: {} },
})
const narrowSchema = new Schema({ nodes, marks })
const titledSchema = new Schema({ nodes: { ...nodes, doc: { content: 'heading block*' } }, marks })
const listSchema = new Schema({
  nodes: {
    ...nodes,
    list: { group: 'block', content: 'item+', toDOM: () => ['ul', 0] },
    item: { content: 'paragraph block*', toDOM: () => ['li', 0] },
  },
  marks,
})

const paragraph = (text: string) => richSchema.node('paragraph', null, richSchema.text(text))
const doc = (...content: Node[]) => richSchema.node('doc', null, content)

const cases: [string, Node, Schema, string][] = [
  [
    'an unknown node',
    doc(paragraph('Before'), richSchema.node('secret', null, richSchema.text('Hidden'))),
    narrowSchema,
    'doc(paragraph("Before"))',
  ],
  [
    'an unknown mark',
    doc(
      paragraph('Visible'),
      richSchema.node(
        'paragraph',
        null,
        richSchema.text('Hidden', [richSchema.mark('secretMark')]),
      ),
    ),
    narrowSchema,
    'doc(paragraph("Visible"), paragraph)',
  ],
  [
    'a missing required node',
    doc(paragraph('Body')),
    titledSchema,
    'doc(heading, paragraph("Body"))',
  ],
  [
    'an empty list item',
    doc(
      richSchema.node('list', null, [
        richSchema.node('item'),
        richSchema.node('item', null, paragraph('Item')),
      ]),
    ),
    listSchema,
    'doc(list(item(paragraph("Item"))))',
  ],
]

const addTextAfterFirstText = (fragment: Y.XmlFragment) => {
  const firstParagraph = fragment.get(0) as Y.XmlElement

  firstParagraph.insert(1, [new Y.XmlText(' world')])
}

describe('keeping content that does not fit the schema', () => {
  const documents: Y.Doc[] = []
  const views: EditorView[] = []

  afterEach(() => {
    views.forEach(view => view.destroy())
    documents.forEach(document => document.destroy())
    views.length = 0
    documents.length = 0
  })

  const createView = (
    content: Node,
    schema: Schema,
    prepare: (fragment: Y.XmlFragment) => void = () => {},
  ) => {
    const document = new Y.Doc({ gc: false })
    const fragment = document.getXmlFragment('prosemirror')
    const onInvalidContent = vi.fn()
    const updates: Uint8Array[] = []

    documents.push(document)
    prosemirrorToYXmlFragment(content, fragment)
    prepare(fragment)
    const sharedContent = fragment.toString()
    document.on('update', (update: Uint8Array) => updates.push(update))

    const view = new EditorView(null, {
      state: EditorState.create({
        schema,
        plugins: [ySyncPlugin(fragment, { onInvalidContent }), yUndoPlugin()],
      }),
    })
    views.push(view)

    return { document, fragment, sharedContent, onInvalidContent, updates, view }
  }

  it.each(cases)(
    'keeps shared content with %s and pauses editing',
    (_name, content, schema, expected) => {
      const { fragment, sharedContent, onInvalidContent, updates, view } = createView(
        content,
        schema,
      )

      expect(view.state.doc.toString()).toBe(expected)
      expect(view.editable).toBe(false)
      expect(onInvalidContent).toHaveBeenCalledOnce()
      expect(onInvalidContent.mock.calls[0][0]).toBeInstanceOf(Error)
      expect(ySyncPluginKey.getState(view.state)?.binding.invalidContentError).toBe(
        onInvalidContent.mock.calls[0][0],
      )

      view.dispatch(view.state.tr.insertText('!', 1))

      expect(view.state.doc.toString()).toBe(expected)
      expect(undo(view.state)).toBe(false)
      expect(fragment.toString()).toBe(sharedContent)
      expect(updates).toHaveLength(0)
    },
  )

  it('resumes editing when compatible content arrives', () => {
    const { document, fragment, onInvalidContent, view } = createView(
      doc(paragraph('Before'), richSchema.node('secret', null, richSchema.text('Hidden'))),
      narrowSchema,
    )

    document.transact(() => fragment.delete(1))

    expect(view.editable).toBe(true)
    expect(ySyncPluginKey.getState(view.state)?.binding.invalidContentError).toBeNull()

    view.dispatch(view.state.tr.insertText('!', 7))

    expect(fragment.toString()).toBe('<paragraph>Before!</paragraph>')
    expect(onInvalidContent).toHaveBeenCalledOnce()
  })

  it('reports invalid content once until it is fixed', () => {
    const { document, fragment, onInvalidContent, view } = createView(
      doc(paragraph('Before'), richSchema.node('secret', null, richSchema.text('Hidden'))),
      narrowSchema,
    )
    const remoteParagraph = new Y.XmlElement('paragraph')

    remoteParagraph.insert(0, [new Y.XmlText('Remote')])
    document.transact(() => fragment.insert(0, [remoteParagraph]))

    expect(view.state.doc.toString()).toBe('doc(paragraph("Remote"), paragraph("Before"))')
    expect(view.editable).toBe(false)
    expect(onInvalidContent).toHaveBeenCalledOnce()

    document.transact(() => fragment.delete(2))
    document.transact(() => fragment.insert(2, [new Y.XmlElement('secret')]))

    expect(view.editable).toBe(false)
    expect(onInvalidContent).toHaveBeenCalledTimes(2)
  })

  it('keeps checking nodes that contain skipped content', () => {
    const { document, fragment, view } = createView(
      doc(
        richSchema.node('list', null, [
          richSchema.node('item'),
          richSchema.node('item', null, paragraph('Item')),
        ]),
      ),
      listSchema,
    )
    const list = fragment.get(0) as Y.XmlElement
    const item = list.get(1) as Y.XmlElement
    const text = (item.get(0) as Y.XmlElement).get(0) as Y.XmlText

    document.transact(() => text.insert(4, ' changed'))

    expect(view.state.doc.toString()).toBe('doc(list(item(paragraph("Item changed"))))')
    expect(view.editable).toBe(false)
  })

  it('keeps checking nodes that wrap skipped content', () => {
    const { document, fragment, view } = createView(
      doc(
        richSchema.node(
          'blockquote',
          null,
          richSchema.node(
            'paragraph',
            null,
            richSchema.text('Hidden', [richSchema.mark('secretMark')]),
          ),
        ),
      ),
      narrowSchema,
    )

    document.transact(() => fragment.insert(0, [new Y.XmlElement('paragraph')]))

    expect(view.state.doc.toString()).toBe('doc(paragraph, blockquote(paragraph))')
    expect(view.editable).toBe(false)
  })

  it('pauses editing when content around the selection becomes invalid', () => {
    const { document, fragment, onInvalidContent, view } = createView(
      doc(paragraph('hello world')),
      narrowSchema,
    )
    const text = (fragment.get(0) as Y.XmlElement).get(0) as Y.XmlText

    view.dispatch(view.state.tr.setSelection(TextSelection.create(view.state.doc, 8)))
    document.transact(() => text.format(0, 11, { secretMark: {} }))

    expect(view.state.doc.toString()).toBe('doc(paragraph)')
    expect(view.editable).toBe(false)
    expect(onInvalidContent).toHaveBeenCalledOnce()
  })

  it('pauses editing when all shared content is deleted', () => {
    const { document, fragment, onInvalidContent, updates, view } = createView(
      doc(paragraph('Body')),
      narrowSchema,
    )

    document.transact(() => fragment.delete(0))
    const updateCount = updates.length
    view.dispatch(view.state.tr.setMeta('test', true))

    expect(view.editable).toBe(false)
    expect(onInvalidContent).toHaveBeenCalledOnce()
    expect(fragment.length).toBe(0)
    expect(updates).toHaveLength(updateCount)
  })

  it('pauses editing when content typed in this editor is deleted', () => {
    const document = new Y.Doc()
    const fragment = document.getXmlFragment('prosemirror')
    const onInvalidContent = vi.fn()

    documents.push(document)
    const view = new EditorView(null, {
      state: EditorState.create({
        schema: narrowSchema,
        plugins: [ySyncPlugin(fragment, { onInvalidContent })],
      }),
    })
    views.push(view)

    view.dispatch(view.state.tr.insertText('Hello', 1))
    document.transact(() => fragment.delete(0, fragment.length))
    view.dispatch(view.state.tr.setMeta('test', true))

    expect(view.editable).toBe(false)
    expect(onInvalidContent).toHaveBeenCalledOnce()
    expect(fragment.length).toBe(0)
  })

  it('does not merge text while content is invalid', () => {
    const { fragment, sharedContent, updates, view } = createView(
      doc(paragraph('Hello'), richSchema.node('secret', null, richSchema.text('Hidden'))),
      narrowSchema,
      addTextAfterFirstText,
    )

    expect(view.state.doc.toString()).toBe('doc(paragraph("Hello world"))')
    expect(fragment.toString()).toBe(sharedContent)
    expect(updates).toHaveLength(0)
  })

  it('merges text while content is valid', () => {
    const { fragment, view } = createView(
      doc(paragraph('Hello')),
      narrowSchema,
      addTextAfterFirstText,
    )

    expect(view.state.doc.toString()).toBe('doc(paragraph("Hello world"))')
    expect((fragment.get(0) as Y.XmlElement).length).toBe(1)
  })

  it('hides remote cursors while content is invalid', async () => {
    const document = new Y.Doc()
    const publisherDocument = new Y.Doc()
    const awareness = new Awareness(document)
    const publisher = new Awareness(publisherDocument)
    const fragment = document.getXmlFragment('prosemirror')

    documents.push(document, publisherDocument)
    prosemirrorToYXmlFragment(
      doc(
        richSchema.node(
          'paragraph',
          null,
          richSchema.text('Hidden', [richSchema.mark('secretMark')]),
        ),
        paragraph('Visible'),
      ),
      fragment,
    )
    const view = new EditorView(null, {
      state: EditorState.create({
        schema: narrowSchema,
        plugins: [ySyncPlugin(fragment, { onInvalidContent: () => {} }), yCursorPlugin(awareness)],
      }),
    })
    views.push(view)
    const hiddenText = (fragment.get(0) as Y.XmlElement).get(0) as Y.XmlText
    const position = Y.createRelativePositionFromTypeIndex(hiddenText, 2)
    const getCursorPositions = () =>
      yCursorPluginKey
        .getState(view.state)
        ?.find()
        .map(decoration => decoration.from)

    publisher.setLocalState({
      cursor: { anchor: position, head: position },
      user: { name: 'Remote', color: '#000000' },
    })
    applyAwarenessUpdate(
      awareness,
      encodeAwarenessUpdate(publisher, [publisherDocument.clientID]),
      'test',
    )
    await new Promise(resolve => {
      setTimeout(resolve, 10)
    })

    expect(view.editable).toBe(false)
    expect(getCursorPositions()).toEqual([])

    document.transact(() => hiddenText.format(0, 6, { secretMark: null }))

    expect(view.editable).toBe(true)
    expect(getCursorPositions()).toEqual([3])

    awareness.destroy()
    publisher.destroy()
  })

  it('clears the published cursor while content is invalid', () => {
    const document = new Y.Doc()
    const awareness = new Awareness(document)
    const fragment = document.getXmlFragment('prosemirror')

    documents.push(document)
    prosemirrorToYXmlFragment(doc(paragraph('Hello')), fragment)
    const view = new EditorView(null, {
      state: EditorState.create({
        schema: narrowSchema,
        plugins: [ySyncPlugin(fragment, { onInvalidContent: () => {} }), yCursorPlugin(awareness)],
      }),
    })
    views.push(view)
    // Publishing requires focus, which happy-dom does not provide
    view.hasFocus = () => true

    view.dispatch(view.state.tr.setSelection(TextSelection.create(view.state.doc, 3)))
    expect(awareness.getLocalState()?.cursor).not.toBeNull()

    document.transact(() => fragment.insert(1, [new Y.XmlElement('secret')]))
    expect(view.editable).toBe(false)
    expect(awareness.getLocalState()?.cursor).toBeNull()

    document.transact(() => fragment.delete(1))
    expect(view.editable).toBe(true)
    expect(awareness.getLocalState()?.cursor).not.toBeNull()

    awareness.destroy()
  })

  it('does not restore a snapshot while content is invalid', async () => {
    const { document, fragment, view } = createView(
      doc(paragraph('Before'), richSchema.node('secret', null, richSchema.text('Hidden'))),
      narrowSchema,
    )
    const snapshot = Y.snapshot(document)
    const remoteParagraph = new Y.XmlElement('paragraph')

    remoteParagraph.insert(0, [new Y.XmlText('Remote')])
    document.transact(() => fragment.insert(0, [remoteParagraph]))
    const sharedContent = fragment.toString()

    view.dispatch(
      view.state.tr.setMeta(ySyncPluginKey, {
        snapshot,
        prevSnapshot: snapshot,
        restore: true,
      }),
    )
    await new Promise(resolve => {
      setTimeout(resolve, 10)
    })

    expect(view.state.doc.toString()).toBe('doc(paragraph("Remote"), paragraph("Before"))')
    expect(ySyncPluginKey.getState(view.state)?.snapshot).toBeNull()
    expect(fragment.toString()).toBe(sharedContent)
  })

  it('keeps invalid content while showing a snapshot', async () => {
    const { document, fragment, sharedContent, updates, view } = createView(
      doc(paragraph('Before'), richSchema.node('secret', null, richSchema.text('Hidden'))),
      narrowSchema,
    )
    const snapshot = Y.snapshot(document)

    view.dispatch(view.state.tr.setMeta(ySyncPluginKey, { snapshot, prevSnapshot: snapshot }))
    await new Promise(resolve => {
      setTimeout(resolve, 0)
    })

    expect(view.state.doc.toString()).toBe('doc(paragraph("Before"))')
    expect(fragment.toString()).toBe(sharedContent)
    expect(updates).toHaveLength(0)
  })
})
