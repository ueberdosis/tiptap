import { assert, it } from 'vite-plus/test'
import type { Node } from 'prosemirror-model'
import type { Transaction } from 'prosemirror-state'
import { ReplaceStep } from 'prosemirror-transform'
import type { EditorView } from 'prosemirror-view'
import * as Y from 'yjs'
import { EditorState, Plugin } from 'prosemirror-state'
import { Fragment, Schema, Slice } from 'prosemirror-model'
import { Decoration, DecorationSet } from 'prosemirror-view'
import * as basicSchema from 'prosemirror-schema-basic'
import { undo, ySyncPluginKey, yUndoPluginKey } from '@tiptap/y-tiptap'
import { replaceChangedChildren } from '../../src/lib/utils/binding/replaceChangedChildren.js'
import { createTestView } from '../utils/createTestView.js'
import { schema } from '../utils/testSchema.js'
import { syncDocuments as syncYDocs } from '../utils/syncDocuments.js'

const highlights = new Plugin<DecorationSet>({
  state: {
    init: () => DecorationSet.empty,
    apply: (tr, decorations) => {
      const ranges: { from: number; to: number; id: string }[] | undefined =
        tr.getMeta('highlights')
      return ranges
        ? DecorationSet.create(
            tr.doc,
            ranges.map(range => Decoration.inline(range.from, range.to, {}, { id: range.id })),
          )
        : decorations.map(tr.mapping, tr.doc)
    },
  },
  props: {
    decorations(state) {
      return this.getState(state)
    },
  },
})

const withHighlightedViews = (
  test: (clients: {
    writerDoc: Y.Doc
    readerDoc: Y.Doc
    writer: EditorView
    reader: EditorView
    transactions: Transaction[]
    before: Node
    ranges: ReturnType<typeof highlightRanges>
  }) => void,
) => {
  const writerDoc = new Y.Doc()
  const readerDoc = new Y.Doc()
  const writer = createTestView(writerDoc, schema, true)
  const reader = createTestView(readerDoc, schema, true)
  try {
    reader.updateState(reader.state.reconfigure({ plugins: [...reader.state.plugins, highlights] }))
    writer.dispatch(
      writer.state.tr.replaceWith(0, writer.state.doc.content.size, [
        schema.node('heading', { level: 1 }, schema.text('title')),
        ...['one', 'two', 'three', 'tail'].map(text =>
          schema.node('paragraph', undefined, schema.text(text)),
        ),
      ]),
    )
    syncYDocs(writerDoc, readerDoc)
    const tailStart =
      reader.state.doc.content.size -
      reader.state.doc.child(reader.state.doc.childCount - 1).nodeSize
    reader.dispatch(
      reader.state.tr.setMeta('highlights', [
        { from: 1, to: 3, id: 'title' },
        { from: tailStart + 1, to: tailStart + 3, id: 'tail' },
      ]),
    )
    const transactions: Transaction[] = []
    const dispatch = reader.dispatch.bind(reader)
    reader.dispatch = tr => {
      if (tr.getMeta(ySyncPluginKey)?.isChangeOrigin) transactions.push(tr)
      dispatch(tr)
    }
    test({
      writerDoc,
      readerDoc,
      writer,
      reader,
      transactions,
      before: reader.state.doc,
      ranges: highlightRanges(reader),
    })
    assert(reader.state.doc.eq(writer.state.doc), 'documents converge')
  } finally {
    writer.destroy()
    reader.destroy()
    writerDoc.destroy()
    readerDoc.destroy()
  }
}

const highlightRanges = (view: EditorView) =>
  (highlights.getState(view.state) ?? DecorationSet.empty).find().map(decoration => ({
    from: decoration.from,
    to: decoration.to,
    id: decoration.spec.id,
  }))

it('remote typing after local edit preserves middle highlight', () => {
  withHighlightedViews(({ writerDoc, readerDoc, writer, reader, transactions }) => {
    reader.dispatch(reader.state.tr.insertText('LOCAL ', 1))
    syncYDocs(writerDoc, readerDoc)
    const before = reader.state.doc
    const middleStart = before.child(0).nodeSize + before.child(1).nodeSize
    const ranges = [{ from: middleStart + 1, to: middleStart + 3, id: 'middle' }]
    reader.dispatch(reader.state.tr.setMeta('highlights', ranges))
    transactions.length = 0
    writer.dispatch(writer.state.tr.insertText('!', writer.state.doc.content.size - 1))
    syncYDocs(writerDoc, readerDoc)
    assert.deepEqual(highlightRanges(reader), ranges)
    assert(
      reader.state.doc.firstChild === before.firstChild,
      'equal local nodes keep their identity after projection',
    )
    const step = transactions[0].steps[0]
    assert(step instanceof ReplaceStep)
    assert(
      step.from === before.content.size - before.child(before.childCount - 1).nodeSize,
      'replacement covers only the remote edit',
    )
  })
})

it('remote typing preserves untouched highlights', () => {
  withHighlightedViews(({ writerDoc, readerDoc, writer, reader, transactions, before, ranges }) => {
    const start = before.child(0).nodeSize + before.child(1).nodeSize
    writer.dispatch(writer.state.tr.insertText('!', start + 2))
    syncYDocs(writerDoc, readerDoc)
    assert(transactions.length === 1, 'one remote transaction is dispatched')
    const step = transactions[0].steps[0]
    assert(step instanceof ReplaceStep)
    assert(
      step.from === start && step.to === start + before.child(2).nodeSize,
      'replacement covers only the edited block',
    )
    assert.deepEqual(highlightRanges(reader), [
      ranges[0],
      { ...ranges[1], from: ranges[1].from + 1, to: ranges[1].to + 1 },
    ])
  })
})

it('remote attributes preserve other highlights', () => {
  withHighlightedViews(({ writerDoc, readerDoc, writer, reader, transactions, before, ranges }) => {
    writer.dispatch(writer.state.tr.setNodeMarkup(0, undefined, { level: 2 }))
    syncYDocs(writerDoc, readerDoc)
    const step = transactions[0].steps[0]
    assert(step instanceof ReplaceStep)
    assert(
      step.from === 0 && step.to === before.child(0).nodeSize,
      'replacement covers only the heading',
    )
    assert.deepEqual(highlightRanges(reader), [ranges[1]])
  })
})

it('remote block insertion preserves highlights', () => {
  withHighlightedViews(({ writerDoc, readerDoc, writer, reader, transactions, before, ranges }) => {
    const start = before.child(0).nodeSize
    const block = schema.node('paragraph', undefined, schema.text('inserted'))
    writer.dispatch(writer.state.tr.insert(start, block))
    syncYDocs(writerDoc, readerDoc)
    const step = transactions[0].steps[0]
    assert(step instanceof ReplaceStep)
    assert(step.from === start && step.to === start, 'replacement is a block insertion')
    assert.deepEqual(highlightRanges(reader), [
      ranges[0],
      { ...ranges[1], from: ranges[1].from + block.nodeSize, to: ranges[1].to + block.nodeSize },
    ])
  })
})

it('remote block deletion preserves highlights', () => {
  withHighlightedViews(({ writerDoc, readerDoc, writer, reader, transactions, before, ranges }) => {
    const start = before.child(0).nodeSize + before.child(1).nodeSize
    const size = before.child(2).nodeSize
    writer.dispatch(writer.state.tr.delete(start, start + size))
    syncYDocs(writerDoc, readerDoc)
    const step = transactions[0].steps[0]
    assert(step instanceof ReplaceStep)
    assert(
      step.from === start && step.to === start + size,
      'replacement deletes only the removed block',
    )
    assert.deepEqual(highlightRanges(reader), [
      ranges[0],
      { ...ranges[1], from: ranges[1].from - size, to: ranges[1].to - size },
    ])
  })
})

it('remote edits replace one changed span', () => {
  withHighlightedViews(({ writerDoc, readerDoc, reader, transactions, before, ranges }) => {
    writerDoc.transact(() => {
      const fragment = writerDoc.getXmlFragment('prosemirror')
      for (const [index, text] of [
        [1, '!'],
        [3, '?'],
      ] as const) {
        const block = fragment.get(index)
        assert(block instanceof Y.XmlElement)
        const ytext = block.get(0)
        assert(ytext instanceof Y.XmlText)
        ytext.insert(1, text)
      }
    })
    syncYDocs(writerDoc, readerDoc)
    assert(transactions.length === 1, 'batched edits dispatch one remote transaction')
    assert(transactions[0].steps.length === 1, 'batched edits use one replacement')
    const step = transactions[0].steps[0]
    assert(step instanceof ReplaceStep)
    assert(step.from === before.child(0).nodeSize, 'replacement starts at the first changed block')
    assert(
      step.to === before.content.size - before.child(before.childCount - 1).nodeSize,
      'replacement ends after the last changed block',
    )
    assert.deepEqual(highlightRanges(reader), [
      ranges[0],
      { ...ranges[1], from: ranges[1].from + 2, to: ranges[1].to + 2 },
    ])
  })
})

it('remote undo preserves untouched highlights', () => {
  withHighlightedViews(({ writerDoc, readerDoc, writer, reader, ranges }) => {
    const start = reader.state.doc.child(0).nodeSize + 2
    const undoState = yUndoPluginKey.getState(writer.state)
    assert(undoState)
    undoState.undoManager.stopCapturing()
    writer.dispatch(writer.state.tr.insertText('!', start))
    syncYDocs(writerDoc, readerDoc)
    undo(writer.state)
    syncYDocs(writerDoc, readerDoc)
    assert.deepEqual(highlightRanges(reader), ranges)
  })
})

it('remote block move preserves outside highlights', () => {
  withHighlightedViews(({ writerDoc, readerDoc, writer, reader, transactions, before, ranges }) => {
    const start = before.child(0).nodeSize
    const block = writer.state.doc.child(1)
    const end = before.content.size - before.child(before.childCount - 1).nodeSize
    writer.dispatch(
      writer.state.tr.delete(start, start + block.nodeSize).insert(end - block.nodeSize, block),
    )
    syncYDocs(writerDoc, readerDoc)
    assert.deepEqual(highlightRanges(reader), ranges)
    const step = transactions[0].steps[0]
    assert(step instanceof ReplaceStep)
    assert(step.from === start && step.to === end, 'replacement covers only the reordered span')
  })
})

it('empty remote fragment keeps valid document', () => {
  withHighlightedViews(({ writerDoc, readerDoc, reader, transactions, before }) => {
    const fragment = writerDoc.getXmlFragment('prosemirror')
    fragment.delete(0, fragment.length)
    syncYDocs(writerDoc, readerDoc)
    assert(
      reader.state.doc.childCount === 1 &&
        reader.state.doc.child(0).type === schema.nodes.paragraph,
      'empty content gets the required paragraph',
    )
    assert(reader.state.doc.textContent === '', 'all previous content is removed')
    assert(reader.state.selection.head === 1, 'selection stays inside the empty paragraph')
    assert(transactions[0].steps.length === 1, 'schema fallback uses one replacement')
    assert(transactions[0].steps[0] instanceof ReplaceStep)
    assert(
      transactions[0].steps[0].to === before.content.size,
      'replacement covers the deleted content',
    )
  })
})

it('unchanged projection does not replace content', () => {
  const state = EditorState.create({ schema })
  const tr = replaceChangedChildren(state.tr, state.doc.content)
  assert(tr.steps.length === 0 && !tr.docChanged, 'unchanged content needs no replacement')
})

it('schema fitting falls back to full replacement', () => {
  const strictSchema = new Schema({
    nodes: { ...basicSchema.nodes, doc: { content: 'heading paragraph+' } },
    marks: basicSchema.marks,
  })
  const doc = strictSchema.node('doc', undefined, [
    strictSchema.node('heading', undefined, strictSchema.text('title')),
    strictSchema.node('paragraph', undefined, strictSchema.text('one')),
    strictSchema.node('paragraph', undefined, strictSchema.text('two')),
  ])
  const state = EditorState.create({ doc })
  const content = Fragment.from([doc.child(1), doc.child(2)])
  const expected = state.tr.replace(0, doc.content.size, new Slice(content, 0, 0)).doc
  const tr = replaceChangedChildren(state.tr, content)
  assert(tr.doc.eq(expected), 'schema fitting preserves the full-replacement result')
  assert(tr.steps[0] instanceof ReplaceStep)
  assert(
    tr.steps.length === 1 && tr.steps[0].to === doc.content.size,
    'fallback uses one full replacement',
  )
})
