import type { Node } from 'prosemirror-model'
import { Plugin } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { afterEach, describe, expect, it } from 'vite-plus/test'
import * as Y from 'yjs'
import { createTestView } from '../utils/createTestView.js'
import { schema } from '../utils/testSchema.js'

const paragraphs = (count: number, prefix: string) =>
  Array.from({ length: count }, (_, index) =>
    schema.node('paragraph', undefined, schema.text(`${prefix} ${index}`)),
  )

const topLevelNodes = (view: EditorView) => {
  const nodes: Node[] = []
  view.state.doc.forEach(node => nodes.push(node))
  return nodes
}

// Same as editor.registerPlugin(): every plugin view is destroyed and created again
const addPlugin = (view: EditorView) =>
  view.updateState(view.state.reconfigure({ plugins: [...view.state.plugins, new Plugin({})] }))

describe('reconfiguring the editor state', () => {
  const documents: Y.Doc[] = []
  const views: EditorView[] = []

  const setup = () => {
    const local = new Y.Doc()
    const remote = new Y.Doc()
    local.on('update', (update: Uint8Array, origin: unknown) => {
      if (origin !== remote) Y.applyUpdate(remote, update, local)
    })
    remote.on('update', (update: Uint8Array, origin: unknown) => {
      if (origin !== local) Y.applyUpdate(local, update, remote)
    })
    const view = createTestView(local)
    const remoteView = createTestView(remote)
    documents.push(local, remote)
    views.push(view, remoteView)
    view.dispatch(
      view.state.tr.replaceWith(0, view.state.doc.content.size, paragraphs(20, 'block')),
    )

    return { view, remoteView, remote }
  }

  afterEach(() => {
    views.forEach(view => view.destroy())
    documents.forEach(document => document.destroy())
    views.length = 0
    documents.length = 0
  })

  it('keeps the document nodes', () => {
    const { view } = setup()
    const before = topLevelNodes(view)

    addPlugin(view)

    expect(topLevelNodes(view)).toEqual(before)
    topLevelNodes(view).forEach((node, index) => expect(node).toBe(before[index]))
  })

  it('keeps the DOM of unchanged blocks when a remote change follows', () => {
    const { view, remoteView } = setup()
    addPlugin(view)
    const before = Array.from(view.dom.children)

    remoteView.dispatch(remoteView.state.tr.insert(0, paragraphs(12, 'remote')))

    const after = Array.from(view.dom.children)
    expect(after).toHaveLength(before.length + 12)
    after.slice(12).forEach((element, index) => expect(element).toBe(before[index]))
  })

  it('shows remote changes made while no view was attached to the state', () => {
    const { view, remoteView, remote } = setup()
    const { state } = view
    view.destroy()

    remoteView.dispatch(remoteView.state.tr.insertText('remote ', 1))
    const newView = new EditorView(null, { state })
    views.push(newView)

    expect(newView.state.doc.textContent).toContain('remote block 0')

    newView.dispatch(newView.state.tr.insertText('local ', newView.state.doc.content.size - 1))
    const remoteContent = remote.getXmlFragment('prosemirror').toString()
    expect(remoteContent).toContain('remote block 0')
    expect(remoteContent).toContain('local ')
    expect(remoteView.state.doc.textContent).toContain('remote block 0')
    expect(remoteView.state.doc.textContent).toContain('local ')
  })
})
