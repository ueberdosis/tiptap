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
    appendHeading: true,
  },
])(
  'keeps concurrent typing with its text when $name',
  ({ edit, offset, expected, surrounded = true, selectionLength = 0, appendHeading = false }) => {
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

    try {
      if (appendHeading) {
        const heading = new Plugin({
          appendTransaction: (transactions, _, state) =>
            transactions.some(transaction => transaction.getMeta('addHeading'))
              ? state.tr.insert(0, schema.node('heading', null, schema.text('Leading')))
              : null,
        })
        first.updateState(first.state.reconfigure({ plugins: [...first.state.plugins, heading] }))
        second.dispatch(second.state.tr.insertText('!', 2))
      }
      first.dispatch(
        first.state.tr.setSelection(
          TextSelection.create(first.state.doc, start + offset, start + offset + selectionLength),
        ),
      )
      edit(first)
      second.dispatch(second.state.tr.insertText('!', start + 1 + Number(appendHeading)))

      const firstUpdate = Y.encodeStateAsUpdate(firstDoc)
      const secondUpdate = Y.encodeStateAsUpdate(secondDoc)
      Y.applyUpdate(firstDoc, secondUpdate)
      Y.applyUpdate(secondDoc, firstUpdate)

      for (const view of [first, second]) {
        const blocks: string[] = []
        view.state.doc.forEach(node => blocks.push(node.textContent))
        expect(blocks).toEqual([
          ...(appendHeading ? ['Leading', 'B!efore'] : before),
          ...expected,
          ...after,
        ])
      }
      expect(first.state.doc.eq(second.state.doc)).toBe(true)
      const originalIndex = before.length + (offset === 0 ? 1 : 0) + Number(appendHeading)
      expect(fragment.get(originalIndex)).toBe(original)
    } finally {
      first.destroy()
      second.destroy()
      firstDoc.destroy()
      secondDoc.destroy()
    }
  },
)
