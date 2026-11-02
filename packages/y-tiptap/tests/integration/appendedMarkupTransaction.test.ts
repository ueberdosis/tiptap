import { Schema } from 'prosemirror-model'
import { EditorState, Plugin } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { ySyncPlugin } from '@tiptap/y-tiptap'
import { afterEach, describe, expect, it } from 'vite-plus/test'
import * as Y from 'yjs'

const schema = new Schema({
  nodes: {
    doc: { content: 'block+' },
    paragraph: {
      group: 'block',
      content: 'inline*',
      toDOM: () => ['p', 0],
    },
    heading: {
      group: 'block',
      content: 'inline*',
      attrs: { id: { default: null } },
      toDOM: () => ['h1', 0],
    },
    text: { group: 'inline' },
  },
})

// Stands in for anchor extensions like the table of contents, which assign an
// id to a heading through appendTransaction as soon as it has text
describe('appended markup transactions', () => {
  const documents: Y.Doc[] = []
  const views: EditorView[] = []

  afterEach(() => {
    views.forEach(view => view.destroy())
    documents.forEach(document => document.destroy())
    views.length = 0
    documents.length = 0
  })

  const assignAnchorIds: Plugin = new Plugin({
    appendTransaction: (transactions, _oldState, newState) => {
      if (!transactions.some(transaction => transaction.docChanged)) {
        return null
      }

      const transaction = newState.tr
      let modified = false

      newState.doc.descendants((node, position) => {
        if (node.type.name === 'heading' && node.textContent.length > 0 && node.attrs.id === null) {
          transaction.setNodeMarkup(position, undefined, { ...node.attrs, id: 'anchor' })
          modified = true
        }
      })

      return modified ? transaction : null
    },
  })

  const createClient = () => {
    const document = new Y.Doc({ gc: false })
    documents.push(document)
    const view = new EditorView(null, {
      state: EditorState.create({
        schema,
        plugins: [ySyncPlugin(document.getXmlFragment('prosemirror')), assignAnchorIds],
      }),
    })
    views.push(view)
    return { document, view }
  }

  // https://github.com/ueberdosis/tiptap/issues/8644
  it('keeps the first keystroke in a heading when an appended transaction marks it up', () => {
    const client = createClient()

    // An empty heading never receives an anchor id and stays in sync
    client.view.dispatch(client.view.state.tr.insert(0, schema.node('heading')))
    expect(client.view.state.doc.textContent).toBe('')

    // Typing the first character makes the appended transaction mark the
    // heading up in the same dispatch, while the fragment still lags one
    // transaction behind
    client.view.dispatch(client.view.state.tr.insertText('A', 1))

    expect(client.view.state.doc.textContent).toBe('A')
    expect(client.document.getXmlFragment('prosemirror').toString()).toContain('A')
  })
})
