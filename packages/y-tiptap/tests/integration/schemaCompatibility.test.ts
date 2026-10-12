import { Schema } from 'prosemirror-model'
import { EditorState } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { nodes, marks } from 'prosemirror-schema-basic'
import {
  initProseMirrorDoc,
  prosemirrorToYXmlFragment,
  yDocToProsemirrorJSON,
  ySyncPlugin,
  ySyncPluginKey,
  yUndoPlugin,
  undo,
  redo,
  yXmlFragmentToProseMirrorRootNode,
} from '@tiptap/y-tiptap'
import { afterEach, describe, expect, it } from 'vite-plus/test'
import * as Y from 'yjs'

const richSchema = new Schema({
  nodes: {
    ...nodes,
    secret: { group: 'block', content: 'text*', toDOM: () => ['aside', 0] },
  },
  marks: { ...marks, secretMark: { toDOM: () => ['span', { class: 'secret' }, 0] } },
})
const narrowSchema = new Schema({ nodes, marks })

describe('schema compatibility', () => {
  const documents: Y.Doc[] = []
  const views: EditorView[] = []

  afterEach(() => {
    views.forEach(view => view.destroy())
    documents.forEach(document => document.destroy())
    views.length = 0
    documents.length = 0
  })

  const createDocument = () => {
    const document = new Y.Doc({ gc: false })
    documents.push(document)
    return document
  }

  const paragraph = (text: string) => richSchema.node('paragraph', null, richSchema.text(text))
  const sharedContent = (kind: 'node' | 'mark') =>
    richSchema.node('doc', null, [
      paragraph('Before'),
      kind === 'node'
        ? richSchema.node('secret', null, richSchema.text('Hidden'))
        : richSchema.node(
            'paragraph',
            null,
            richSchema.text('Hidden', [richSchema.mark('secretMark')]),
          ),
      paragraph('After'),
    ])

  const createView = (document: Y.Doc, schema = narrowSchema) => {
    const view = new EditorView(null, {
      state: EditorState.create({
        schema,
        plugins: [ySyncPlugin(document.getXmlFragment('prosemirror')), yUndoPlugin()],
      }),
    })
    views.push(view)
    return view
  }

  const bindingOf = (view: EditorView) => {
    const state = ySyncPluginKey.getState(view.state)
    if (!state) throw new Error('Missing sync plugin')
    return state.binding
  }

  describe.each([
    ['root conversion', yXmlFragmentToProseMirrorRootNode],
    [
      'initial document',
      (fragment: Y.XmlFragment, schema: Schema) => initProseMirrorDoc(fragment, schema).doc,
    ],
  ] as const)('headless %s', (_name, convert) => {
    it('rejects empty content when the schema requires a block', () => {
      const document = createDocument()
      const before = Y.encodeStateAsUpdate(document)

      expect(() => convert(document.getXmlFragment('prosemirror'), narrowSchema)).toThrow(
        RangeError,
      )
      expect(Y.encodeStateAsUpdate(document)).toEqual(before)
    })

    it('accepts empty content when the schema allows it', () => {
      const document = createDocument()
      const schema = new Schema({ nodes: { ...nodes, doc: { content: 'block*' } }, marks })

      const result = convert(document.getXmlFragment('prosemirror'), schema)

      expect(result.content.childCount).toBe(0)
      expect(() => result.check()).not.toThrow()
    })

    it('preserves valid nonempty content', () => {
      const document = createDocument()
      const content = narrowSchema.node(
        'doc',
        null,
        narrowSchema.node('paragraph', null, narrowSchema.text('Hello')),
      )
      const fragment = document.getXmlFragment('prosemirror')
      prosemirrorToYXmlFragment(content, fragment)

      const result = convert(fragment, narrowSchema)

      expect(result.eq(content)).toBe(true)
      expect(() => result.check()).not.toThrow()
    })
  })

  it.each(['node', 'mark'] as const)(
    'leaves unknown %s content intact during headless conversion',
    kind => {
      const document = createDocument()
      const fragment = document.getXmlFragment('prosemirror')
      prosemirrorToYXmlFragment(sharedContent(kind), fragment)
      const before = Y.encodeStateAsUpdate(document)
      const updates: Uint8Array[] = []
      document.on('update', update => updates.push(update))

      expect(() => yXmlFragmentToProseMirrorRootNode(fragment, narrowSchema)).toThrow()
      expect(Y.encodeStateAsUpdate(document)).toEqual(before)
      expect(updates).toHaveLength(0)
    },
  )

  it('does not merge adjacent shared text types during projection', () => {
    const document = createDocument()
    const fragment = document.getXmlFragment('prosemirror')
    const element = new Y.XmlElement('paragraph')
    const first = new Y.XmlText()
    const second = new Y.XmlText()
    first.insert(0, 'Hello')
    second.insert(0, ' world')
    element.insert(0, [first, second])
    fragment.insert(0, [element])
    const before = Y.encodeStateAsUpdate(document)

    expect(yXmlFragmentToProseMirrorRootNode(fragment, narrowSchema).textContent).toBe(
      'Hello world',
    )
    expect(Y.encodeStateAsUpdate(document)).toEqual(before)
    expect(element.toArray()).toEqual([first, second])
  })

  it('does not fit incompatible shared blocks into a narrower document structure', () => {
    const document = createDocument()
    const fragment = document.getXmlFragment('prosemirror')
    const schema = new Schema({ nodes: { ...nodes, doc: { content: 'paragraph+' } }, marks })
    prosemirrorToYXmlFragment(
      richSchema.node('doc', null, [
        richSchema.node('heading', null, richSchema.text('Title')),
        paragraph('After'),
      ]),
      fragment,
    )
    const before = Y.encodeStateAsUpdate(document)

    expect(() => yXmlFragmentToProseMirrorRootNode(fragment, schema)).toThrow('document schema')
    const view = createView(document, schema)
    expect(view.editable).toBe(false)
    expect(bindingOf(view).projectionError).toBeInstanceOf(Error)
    view.dispatch(view.state.tr.insertText('!', 1))
    expect(Y.encodeStateAsUpdate(document)).toEqual(before)
  })

  it.each(['node', 'mark'] as const)(
    'does not write back a partial initial projection of unknown %s content',
    kind => {
      const writer = createDocument()
      const reader = createDocument()
      const content = sharedContent(kind)
      prosemirrorToYXmlFragment(content, writer.getXmlFragment('prosemirror'))
      const expected = yDocToProsemirrorJSON(writer)
      Y.applyUpdate(reader, Y.encodeStateAsUpdate(writer))
      const before = Y.encodeStateAsUpdate(reader)
      const view = createView(reader)
      const lastValidDocument = view.state.doc

      expect(view.editable).toBe(false)
      expect(bindingOf(view).projectionError).toBeInstanceOf(Error)
      view.dispatch(view.state.tr.insertText('!', 1))
      bindingOf(view)._prosemirrorChanged(
        narrowSchema.node(
          'doc',
          null,
          narrowSchema.node('paragraph', null, narrowSchema.text('Replacement')),
        ),
      )

      expect(view.state.doc).toBe(lastValidDocument)
      expect(Y.encodeStateAsUpdate(reader)).toEqual(before)
      Y.applyUpdate(writer, Y.encodeStateAsUpdate(reader))
      expect(yDocToProsemirrorJSON(writer)).toEqual(expected)
    },
  )

  it.each(['node', 'mark'] as const)(
    'keeps the last valid projection after receiving unknown %s content',
    kind => {
      const writer = createDocument()
      const reader = createDocument()
      prosemirrorToYXmlFragment(
        richSchema.node('doc', null, paragraph('Before')),
        writer.getXmlFragment('prosemirror'),
      )
      Y.applyUpdate(reader, Y.encodeStateAsUpdate(writer))
      const view = createView(reader)
      const before = view.state.doc
      const updates: Uint8Array[] = []
      reader.on('update', (update, origin) => {
        if (origin === ySyncPluginKey) updates.push(update)
      })
      const content = sharedContent(kind)
      prosemirrorToYXmlFragment(content, writer.getXmlFragment('prosemirror'))
      const expected = yDocToProsemirrorJSON(writer)

      expect(() => Y.applyUpdate(reader, Y.encodeStateAsUpdate(writer))).not.toThrow()
      expect(view.state.doc).toBe(before)
      expect(view.editable).toBe(false)
      expect(bindingOf(view).projectionError).toBeInstanceOf(Error)
      view.dispatch(view.state.tr.insertText('!', 2))
      expect(view.state.doc).toBe(before)
      expect(updates).toHaveLength(0)
      Y.applyUpdate(writer, Y.encodeStateAsUpdate(reader))
      expect(yDocToProsemirrorJSON(writer)).toEqual(expected)

      prosemirrorToYXmlFragment(
        richSchema.node('doc', null, paragraph('Recovered')),
        writer.getXmlFragment('prosemirror'),
      )
      Y.applyUpdate(reader, Y.encodeStateAsUpdate(writer))
      expect(view.state.doc.textContent).toBe('Recovered')
      expect(view.editable).toBe(true)
      expect(bindingOf(view).projectionError).toBeNull()
      view.dispatch(view.state.tr.insertText('!', 2))
      Y.applyUpdate(writer, Y.encodeStateAsUpdate(reader))
      expect(yDocToProsemirrorJSON(writer)).toEqual(view.state.doc.toJSON())
    },
  )

  it.each(['undo', 'redo'] as const)('blocks %s while the binding is incompatible', command => {
    const document = createDocument()
    const fragment = document.getXmlFragment('prosemirror')
    prosemirrorToYXmlFragment(richSchema.node('doc', null, paragraph('Before')), fragment)
    const view = createView(document)
    view.dispatch(view.state.tr.insertText(' local', 7))
    if (command === 'redo') undo(view.state)
    const element = fragment.get(0)
    if (!(element instanceof Y.XmlElement)) throw new Error('Missing paragraph')
    const text = element.get(0)
    if (!(text instanceof Y.XmlText)) throw new Error('Missing text')
    text.format(0, text.length, { secretMark: {} })
    const before = Y.encodeStateAsUpdate(document)

    expect(bindingOf(view).projectionError).toBeInstanceOf(Error)
    expect((command === 'undo' ? undo : redo)(view.state)).toBe(false)
    expect(Y.encodeStateAsUpdate(document)).toEqual(before)
  })

  it.each(['node', 'mark'] as const)(
    'recovers from an incompatible %s snapshot without changing live content',
    async kind => {
      const document = createDocument()
      const fragment = document.getXmlFragment('prosemirror')
      prosemirrorToYXmlFragment(richSchema.node('doc', null, paragraph('Earlier')), fragment)
      const compatible = Y.snapshot(document)
      prosemirrorToYXmlFragment(sharedContent(kind), fragment)
      const incompatible = Y.snapshot(document)
      const view = createView(document)
      const binding = bindingOf(view)
      const before = Y.encodeStateAsUpdate(document)

      binding.renderSnapshot(incompatible, incompatible)
      await new Promise(resolve => setTimeout(resolve, 10))
      expect(binding.projectionError).toBeInstanceOf(Error)
      binding.renderSnapshot(compatible, compatible)
      await new Promise(resolve => setTimeout(resolve, 10))

      expect(view.state.doc.textContent).toBe('Earlier')
      expect(binding.projectionError).toBeNull()
      expect(view.editable).toBe(false)
      binding._prosemirrorChanged(view.state.doc)
      expect(undo(view.state)).toBe(false)
      expect(redo(view.state)).toBe(false)
      expect(Y.encodeStateAsUpdate(document)).toEqual(before)
      binding.unrenderSnapshot()
      expect(binding.projectionError).toBeInstanceOf(Error)
      expect(Y.encodeStateAsUpdate(document)).toEqual(before)

      prosemirrorToYXmlFragment(richSchema.node('doc', null, paragraph('Recovered')), fragment)
      binding.unrenderSnapshot()
      expect(view.state.doc.textContent).toBe('Recovered')
      expect(view.editable).toBe(true)
    },
  )

  it.each(['node', 'mark'] as const)(
    'does not restore a partial snapshot containing an unknown %s',
    async kind => {
      const document = createDocument()
      const fragment = document.getXmlFragment('prosemirror')
      prosemirrorToYXmlFragment(sharedContent(kind), fragment)
      const incompatible = Y.snapshot(document)
      prosemirrorToYXmlFragment(richSchema.node('doc', null, paragraph('Current')), fragment)
      const view = createView(document)
      const before = Y.encodeStateAsUpdate(document)

      view.dispatch(
        view.state.tr.setMeta(ySyncPluginKey, {
          snapshot: incompatible,
          prevSnapshot: incompatible,
          restore: true,
        }),
      )
      await new Promise(resolve => setTimeout(resolve, 10))

      expect(view.state.doc.textContent).toBe('Current')
      expect(bindingOf(view).projectionError).toBeInstanceOf(Error)
      expect(view.editable).toBe(false)
      expect(Y.encodeStateAsUpdate(document)).toEqual(before)
      bindingOf(view).unrenderSnapshot()
      expect(view.editable).toBe(true)
    },
  )
})
