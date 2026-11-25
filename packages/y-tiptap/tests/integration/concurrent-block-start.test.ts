import { splitBlock } from 'prosemirror-commands'
import { Plugin, TextSelection } from 'prosemirror-state'
import type { EditorView } from 'prosemirror-view'
import { prosemirrorToYXmlFragment } from '@tiptap/y-tiptap'
import { expect, it } from 'vite-plus/test'
import * as Y from 'yjs'
import { createTestView } from '../utils/createTestView.js'
import { syncDocuments } from '../utils/syncDocuments.js'
import { schema } from '../utils/testSchema.js'

const split = (view: EditorView) => expect(splitBlock(view.state, view.dispatch)).toBe(true)
const paste = (html: string) => (view: EditorView) => expect(view.pasteHTML(html)).toBe(true)
const heading = schema.node('heading', null, schema.text('Leading'))
const withLeadingHeading = ['Leading', 'B!efore']

it.each([
  { name: 'splitting at the start', edit: split, offset: 0, expected: ['', 't!arget'] },
  { name: 'splitting in the middle', edit: split, offset: 3, expected: ['t!ar', 'get'] },
  { name: 'splitting at the end', edit: split, offset: 6, expected: ['t!arget', ''] },
  {
    name: 'pasting paragraphs at the start',
    edit: paste('<p>Pasted one</p><p>Pasted two</p>'),
    offset: 0,
    expected: ['Pasted one', 'Pasted twot!arget'],
  },
  {
    name: 'pasting paragraphs into the only block',
    edit: paste('<p>Pasted one</p><p>Pasted two</p>'),
    offset: 0,
    expected: ['Pasted one', 'Pasted twot!arget'],
    surrounded: false,
  },
  {
    name: 'pasting a repeated prefix with inline formatting',
    edit: paste('<p>Pasted one</p><p><em>Prefix</em><br>target: </p>'),
    offset: 0,
    expected: ['Pasted one', 'Prefixtarget:t!arget'],
  },
  {
    name: 'pasting when a plugin adds a heading and sets the markup of a horizontal rule',
    edit: paste('<p>First</p><hr><p>Prefix:</p>'),
    offset: 0,
    expected: ['First', 'Leading', '', 'Prefix:t!arget'],
    retainedOffset: 3,
    configure: (view: EditorView) => {
      const plugin = new Plugin({
        appendTransaction: (transactions, _, state) => {
          if (!transactions.some(transaction => transaction.getMeta('paste'))) {
            return null
          }
          const position = state.doc.child(0).nodeSize + state.doc.child(1).nodeSize
          return state.tr
            .setNodeMarkup(position, schema.nodes.horizontal_rule)
            .insert(position, heading)
        },
      })
      view.updateState(view.state.reconfigure({ plugins: [...view.state.plugins, plugin] }))
    },
  },
  {
    name: 'pasting a first paragraph identical to the original',
    edit: paste('<p>target</p><p>Prefix:</p>'),
    offset: 0,
    expected: ['target', 'Prefix:t!arget'],
    surrounded: false,
  },
  {
    name: 'pasting at the start with text that resembles the original',
    edit: paste('<p>tarX</p><p>Prefix:</p>'),
    offset: 0,
    expected: ['tarX', 'Prefix:t!arget'],
  },
  {
    name: 'replacing a suffix with the same result as a paste at the start',
    edit: paste('<p>X</p><p>Prefix:target</p>'),
    offset: 3,
    selectionLength: 3,
    expected: ['t!arX', 'Prefix:target'],
  },
  {
    name: 'splitting at the start when a plugin inserts a preceding heading',
    edit: (view: EditorView) =>
      expect(
        splitBlock(view.state, transaction =>
          view.dispatch(transaction.setMeta('addHeading', true)),
        ),
      ).toBe(true),
    offset: 0,
    expected: ['', 't!arget'],
    expectedBefore: withLeadingHeading,
    configure: (view: EditorView) => {
      const plugin = new Plugin({
        appendTransaction: (transactions, _, state) =>
          transactions.some(transaction => transaction.getMeta('addHeading'))
            ? state.tr.insert(0, heading)
            : null,
      })
      view.updateState(view.state.reconfigure({ plugins: [...view.state.plugins, plugin] }))
    },
  },
  {
    name: 'splitting at the start after inserting a heading in the same transaction',
    edit: (view: EditorView) => {
      const transaction = view.state.tr.insert(0, heading)
      view.dispatch(transaction.split(transaction.selection.from))
    },
    offset: 0,
    expected: ['', 't!arget'],
    expectedBefore: withLeadingHeading,
  },
  {
    name: 'typing into the new paragraph in the same transaction as a split',
    edit: (view: EditorView) => {
      view.dispatch(
        view.state.tr.insert(view.state.doc.content.size, heading).split(1).insertText('target', 1),
      )
    },
    offset: 0,
    expected: ['target', 't!arget', 'Leading'],
    surrounded: false,
  },
  {
    name: 'typing into the new paragraph in a transaction appended by a plugin',
    edit: (view: EditorView) => {
      view.dispatch(
        view.state.tr
          .insert(view.state.doc.content.size, heading)
          .split(1)
          .setMeta('fillSplit', true),
      )
    },
    offset: 0,
    expected: ['target', 't!arget', 'Leading'],
    surrounded: false,
    configure: (view: EditorView) => {
      const plugin = new Plugin({
        appendTransaction: (transactions, _, state) =>
          transactions.some(transaction => transaction.getMeta('fillSplit'))
            ? state.tr.insertText('target', 1)
            : null,
      })
      view.updateState(view.state.reconfigure({ plugins: [...view.state.plugins, plugin] }))
    },
  },
  {
    name: 'editing another paragraph after splitting at the start',
    edit: (view: EditorView) => {
      const start = view.state.selection.from
      const transaction = view.state.tr.split(start).insertText('target', start)
      view.dispatch(transaction.insertText('!', transaction.doc.content.size - 1))
    },
    offset: 0,
    expected: ['target', 't!arget'],
    expectedAfter: ['After', 'Last!'],
  },
  {
    name: 'changing another paragraph into a heading after splitting at the start',
    edit: (view: EditorView) => {
      const start = view.state.selection.from
      const transaction = view.state.tr.split(start).insertText('target', start)
      const last = transaction.doc.child(transaction.doc.childCount - 1)
      view.dispatch(
        transaction.setNodeMarkup(
          transaction.doc.content.size - last.nodeSize,
          schema.nodes.heading,
        ),
      )
    },
    offset: 0,
    expected: ['target', 't!arget'],
  },
  ...[true, false].map(splitFirst => ({
    name: `moving an existing paragraph between the split halves with the split ${splitFirst ? 'first' : 'second'}`,
    edit: (view: EditorView) => {
      const preceding = view.state.doc.child(0)
      const transaction = view.state.tr
      if (splitFirst) {
        transaction.split(transaction.selection.from).insert(0, heading)
      } else {
        transaction.insert(0, heading).split(transaction.selection.from)
      }
      transaction.delete(heading.nodeSize, heading.nodeSize + preceding.nodeSize)
      const start = transaction.mapping.map(view.state.selection.from)
      view.dispatch(transaction.insert(transaction.doc.resolve(start).before(), preceding))
    },
    offset: 0,
    expected: ['t!arget'],
    expectedBefore: ['Leading', '', 'B!efore'],
  })),
])(
  'keeps concurrent typing with its text when $name',
  ({
    edit,
    offset,
    expected,
    surrounded = true,
    selectionLength = 0,
    retainedOffset = Number(offset === 0),
    configure,
    expectedBefore,
    expectedAfter,
  }) => {
    const firstDoc = new Y.Doc()
    const secondDoc = new Y.Doc()
    const fragment = firstDoc.getXmlFragment('prosemirror')
    const before = surrounded ? ['Before'] : []
    const after = surrounded ? ['After', 'Last'] : []
    const initial = schema.node(
      'doc',
      null,
      [...before, 'target', ...after].map(text =>
        schema.node('paragraph', null, schema.text(text)),
      ),
    )
    prosemirrorToYXmlFragment(initial, fragment)
    syncDocuments(firstDoc, secondDoc)
    const first = createTestView(firstDoc)
    const second = createTestView(secondDoc)
    const original = fragment.get(before.length)
    const start = surrounded ? initial.child(0).nodeSize + 1 : 1
    const hasLeadingHeading = expectedBefore !== undefined

    try {
      configure?.(first)
      if (hasLeadingHeading) {
        second.dispatch(second.state.tr.insertText('!', 2))
      }
      first.dispatch(
        first.state.tr.setSelection(
          TextSelection.create(first.state.doc, start + offset, start + offset + selectionLength),
        ),
      )
      edit(first)
      second.dispatch(second.state.tr.insertText('!', start + 1 + Number(hasLeadingHeading)))

      const firstUpdate = Y.encodeStateAsUpdate(firstDoc)
      const secondUpdate = Y.encodeStateAsUpdate(secondDoc)
      Y.applyUpdate(firstDoc, secondUpdate)
      Y.applyUpdate(secondDoc, firstUpdate)

      for (const view of [first, second]) {
        const blocks: string[] = []
        view.state.doc.forEach(node => blocks.push(node.textContent))
        expect(blocks).toEqual([
          ...(expectedBefore ?? before),
          ...expected,
          ...(expectedAfter ?? after),
        ])
      }
      expect(first.state.doc.eq(second.state.doc)).toBe(true)
      const originalIndex = before.length + retainedOffset + Number(hasLeadingHeading)
      expect(fragment.get(originalIndex)).toBe(original)
    } finally {
      first.destroy()
      second.destroy()
      firstDoc.destroy()
      secondDoc.destroy()
    }
  },
)

it.each([
  ...[true, false].map(splitFirst => ({
    name: `copied between the split halves with the split ${splitFirst ? 'first' : 'second'}`,
    trailing: [],
    edit: (view: EditorView) => {
      const target = view.state.doc.child(0)
      const sibling = view.state.doc.child(1)
      const transaction = view.state.tr
      if (splitFirst) {
        transaction.split(1).insert(transaction.doc.content.size, heading)
      } else {
        transaction.insert(transaction.doc.content.size, heading).split(1)
      }
      const firstBlockSize = transaction.doc.child(0).nodeSize
      const siblingStart = target.nodeSize + firstBlockSize
      const copy = schema.node(sibling.type, sibling.attrs, sibling.content)
      transaction.delete(siblingStart, siblingStart + sibling.nodeSize)
      view.dispatch(transaction.insert(firstBlockSize, copy))
    },
    expected: ['', 'S!ibling', 'target', 'Leading'],
  })),
  ...[true, false].map(splitFirst => ({
    name: `recreated ${splitFirst ? 'after' : 'before'} the split`,
    trailing: [schema.node('paragraph', null, schema.text('Last'))],
    edit: (view: EditorView) => {
      const target = view.state.doc.child(0)
      const sibling = view.state.doc.child(1)
      const copy = schema.node(sibling.type, sibling.attrs, sibling.content)
      const transaction = view.state.tr
      if (splitFirst) {
        transaction.split(1)
      }
      const siblingStart = target.nodeSize + (splitFirst ? transaction.doc.child(0).nodeSize : 0)
      transaction.replaceWith(siblingStart, siblingStart + sibling.nodeSize, [heading, copy])
      if (!splitFirst) {
        transaction.split(1)
      }
      view.dispatch(transaction)
    },
    typeInTarget: true,
    expected: ['', 't?arget', 'Leading', 'S!ibling', 'Last'],
  })),
  {
    name: 'recreated with the retained paragraph node',
    trailing: [schema.node('paragraph', null, schema.text('Last'))],
    siblingText: 'target',
    typeInTarget: true,
    edit: (view: EditorView) => {
      const transaction = view.state.tr.split(1)
      const retained = transaction.doc.child(1)
      const siblingStart = transaction.doc.child(0).nodeSize + retained.nodeSize
      view.dispatch(
        transaction.replaceWith(siblingStart, siblingStart + retained.nodeSize, [
          heading,
          retained,
        ]),
      )
    },
    expected: ['', 't?arget', 'Leading', 't!arget', 'Last'],
  },
])('keeps typing in a sibling $name', scenario => {
  const { trailing, edit, expected, typeInTarget, siblingText } = scenario
  const firstDoc = new Y.Doc()
  const secondDoc = new Y.Doc()
  const fragment = firstDoc.getXmlFragment('prosemirror')
  const target = schema.node('paragraph', null, schema.text('target'))
  const sibling = schema.node('paragraph', null, schema.text(siblingText ?? 'Sibling'))
  prosemirrorToYXmlFragment(schema.node('doc', null, [target, sibling, ...trailing]), fragment)
  syncDocuments(firstDoc, secondDoc)
  const first = createTestView(firstDoc)
  const second = createTestView(secondDoc)

  try {
    edit(first)
    second.dispatch(second.state.tr.insertText('!', target.nodeSize + 2))
    if (typeInTarget) {
      second.dispatch(second.state.tr.insertText('?', 2))
    }
    syncDocuments(firstDoc, secondDoc)

    for (const view of [first, second]) {
      const blocks: string[] = []
      view.state.doc.forEach(node => blocks.push(node.textContent))
      expect(blocks).toEqual(expected)
    }
  } finally {
    first.destroy()
    second.destroy()
    firstDoc.destroy()
    secondDoc.destroy()
  }
})
