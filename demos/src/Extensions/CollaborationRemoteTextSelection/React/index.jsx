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
    const text = 'Hello world'
    local.dispatch(
      local.state.tr.replaceWith(
        0,
        local.state.doc.content.size,
        schema.node('paragraph', { id: 'one' }, text ? schema.text(text) : undefined),
      ),
    )
    Y.applyUpdate(remoteDoc, Y.encodeStateAsUpdate(localDoc))
    local.dispatch(
      local.state.tr.setSelection(TextSelection.create(local.state.doc, text.length + 1)),
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
    remote.dispatch(remote.state.tr.insertText('A ', 1))
    Y.applyUpdate(localDoc, Y.encodeStateAsUpdate(remoteDoc))
  }
  return (
    <div>
      <div className="control-group">
        <div className="button-group">
          <button onClick={editRemotely}>Insert text before the local caret</button>
        </div>
      </div>
      <div ref={host} />
      <div className="output-group">{selection}</div>
    </div>
  )
}
