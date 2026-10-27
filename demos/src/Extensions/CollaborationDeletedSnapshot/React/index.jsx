import React, { useEffect, useRef, useState } from 'react'
import { Schema } from '@tiptap/pm/model'
import { EditorState } from '@tiptap/pm/state'
import { EditorView } from '@tiptap/pm/view'
import { ySyncPlugin, ySyncPluginKey } from '@tiptap/y-tiptap'
import * as Y from 'yjs'

const schema = new Schema({
  nodes: {
    doc: { content: 'paragraph+' },
    paragraph: {
      content: 'text*',
      attrs: { id: { default: null }, ychange: { default: null } },
      toDOM: node => ['p', { 'data-id': node.attrs.id }, 0],
    },
    text: {},
  },
  marks: {
    ychange: {
      attrs: { type: {}, user: { default: null }, color: { default: null } },
      toDOM: mark => [mark.attrs.type === 'removed' ? 'del' : 'ins', 0],
    },
  },
})

export default function Demo() {
  const host = useRef(null)
  const clients = useRef(null)
  const [output, setOutput] = useState('')
  useEffect(() => {
    const document = new Y.Doc({ gc: false })
    const view = new EditorView(host.current, {
      state: EditorState.create({
        schema,
        plugins: [ySyncPlugin(document.getXmlFragment('prosemirror'))],
      }),
      dispatchTransaction(transaction) {
        this.updateState(this.state.apply(transaction))
        setOutput(JSON.stringify(this.state.doc.toJSON(), null, 2))
      },
    })
    view.dispatch(
      view.state.tr.replaceWith(0, view.state.doc.content.size, [
        schema.node('paragraph', { id: 'original' }, schema.text('Original text')),
        schema.node('paragraph', { id: 'remaining' }, schema.text('Remaining paragraph')),
      ]),
    )
    const previous = Y.snapshot(document)
    clients.current = { document, view, previous }
    return () => {
      clients.current = null
      view.destroy()
      document.destroy()
    }
  }, [])
  const compare = () => {
    const { document, view, previous } = clients.current
    const size = view.state.doc.firstChild.nodeSize
    view.dispatch(view.state.tr.delete(0, size))
    ySyncPluginKey.getState(view.state).binding.renderSnapshot(Y.snapshot(document), previous)
  }
  return (
    <div>
      <div className="control-group">
        <div className="button-group">
          <button onClick={compare}>Delete the first paragraph and compare snapshots</button>
        </div>
      </div>
      <div ref={host} />
      <div className="output-group">
        <pre>{output}</pre>
      </div>
    </div>
  )
}
