import React, { useEffect, useRef, useState } from 'react'
import { Schema } from '@tiptap/pm/model'
import { EditorState, TextSelection } from '@tiptap/pm/state'
import { EditorView } from '@tiptap/pm/view'
import { ySyncPlugin } from '@tiptap/y-tiptap'
import * as Y from 'yjs'

const schema = new Schema({
  nodes: {
    doc: { content: 'paragraph+' },
    paragraph: { content: 'text*', attrs: { id: { default: null } }, toDOM: () => ['p', 0] },
    text: {},
  },
})

export default function Demo() {
  const host = useRef(null)
  const clients = useRef(null)
  const [selection, setSelection] = useState('')
  useEffect(() => {
    const localDoc = new Y.Doc()
    const remoteDoc = new Y.Doc()
    const local = new EditorView(host.current, {
      state: EditorState.create({
        schema,
        plugins: [ySyncPlugin(localDoc.getXmlFragment('prosemirror'))],
      }),
      dispatchTransaction(transaction) {
        this.updateState(this.state.apply(transaction))
        setSelection(
          `Block ${this.state.selection.$from.index(0) + 1}, offset ${this.state.selection.$from.parentOffset}`,
        )
      },
    })
    const remote = new EditorView(null, {
      state: EditorState.create({
        schema,
        plugins: [ySyncPlugin(remoteDoc.getXmlFragment('prosemirror'))],
      }),
    })
    local.dispatch(
      local.state.tr.replaceWith(0, local.state.doc.content.size, [
        schema.node('paragraph', undefined, schema.text('Before')),
        schema.node('paragraph'),
      ]),
    )
    Y.applyUpdate(remoteDoc, Y.encodeStateAsUpdate(localDoc))
    local.dispatch(
      local.state.tr.setSelection(
        TextSelection.create(local.state.doc, local.state.doc.firstChild.nodeSize + 1),
      ),
    )
    clients.current = { localDoc, remoteDoc, remote }
    return () => {
      clients.current = null
      local.destroy()
      remote.destroy()
      localDoc.destroy()
      remoteDoc.destroy()
    }
  }, [])
  const editRemotely = () => {
    const { localDoc, remoteDoc, remote } = clients.current
    remote.dispatch(
      remote.state.tr.insert(remote.state.doc.firstChild.nodeSize, schema.node('paragraph')),
    )
    Y.applyUpdate(localDoc, Y.encodeStateAsUpdate(remoteDoc))
  }
  return (
    <div>
      <div className="control-group">
        <div className="button-group">
          <button onClick={editRemotely}>Insert an empty paragraph before the local caret</button>
        </div>
      </div>
      <div ref={host} />
      <div className="output-group">{selection}</div>
    </div>
  )
}
