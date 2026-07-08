import type { EditorOptions } from '@tiptap/core'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCaret from '@tiptap/extension-collaboration-caret'
import { TextSelection } from '@tiptap/pm/state'
import { act } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import { applyAwarenessUpdate, Awareness, encodeAwarenessUpdate } from 'y-protocols/awareness'
import * as Y from 'yjs'

import { ReactRendererExtension } from '../extension.js'
import { mountEditorContent, tiptapTestNodes, unmountTrackedRoots } from './helpers.js'

afterEach(unmountTrackedRoots)

const BRIDGE = 'test-bridge'

/**
 * Links two Y.Docs the way a provider would: updates flow between them,
 * either live or queued (queued mode simulates offline divergence).
 */
const connectDocs = (a: Y.Doc, b: Y.Doc, live = true) => {
  const queues: Array<{ target: Y.Doc; update: Uint8Array }> = []
  const forward = (target: Y.Doc) => (update: Uint8Array, origin: unknown) => {
    if (origin === BRIDGE) {
      return
    }
    if (live) {
      Y.applyUpdate(target, update, BRIDGE)
    } else {
      queues.push({ target, update })
    }
  }

  Y.applyUpdate(b, Y.encodeStateAsUpdate(a), BRIDGE)
  Y.applyUpdate(a, Y.encodeStateAsUpdate(b), BRIDGE)
  a.on('update', forward(b))
  b.on('update', forward(a))

  return {
    goLive: () => {
      live = true
      queues.forEach(({ target, update }) => Y.applyUpdate(target, update, BRIDGE))
      queues.length = 0
    },
  }
}

/** Links two Awareness instances the way a provider's awareness channel would. */
const connectAwareness = (a: Awareness, b: Awareness) => {
  const forward =
    (from: Awareness, to: Awareness) =>
    (
      { added, updated, removed }: { added: number[]; updated: number[]; removed: number[] },
      origin: unknown,
    ) => {
      if (origin === BRIDGE) {
        return
      }
      const changed = [...added, ...updated, ...removed]

      applyAwarenessUpdate(to, encodeAwarenessUpdate(from, changed), BRIDGE)
    }

  a.on('update', forward(a, b))
  b.on('update', forward(b, a))
}

interface CollabClientOptions {
  ydoc: Y.Doc
  awareness?: Awareness
  user?: { name: string; color: string }
}

/** A collab client rendered by the experimental renderer. */
const renderCollabClient = async ({ ydoc, awareness, user }: CollabClientOptions) => {
  const extensions: EditorOptions['extensions'] = [
    ...tiptapTestNodes,
    ReactRendererExtension,
    Collaboration.configure({ document: ydoc }),
  ]

  if (awareness) {
    extensions.push(
      CollaborationCaret.configure({
        provider: { awareness },
        user,
      }),
    )
  }

  return mountEditorContent({ extensions })
}

/** Two linked clients on fresh Y.Docs — the standard two-client fixture. */
const renderClientPair = async (live = true) => {
  const docA = new Y.Doc()
  const docB = new Y.Doc()
  const link = connectDocs(docA, docB, live)
  const clientA = await renderCollabClient({ ydoc: docA })
  const clientB = await renderCollabClient({ ydoc: docB })

  return { docA, docB, link, clientA, clientB }
}

/** Polls (through act) until the condition holds or the budget runs out. */
const waitFor = async (condition: () => boolean) => {
  for (let attempt = 0; attempt < 40 && !condition(); attempt += 1) {
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 5)) // oxlint-disable-line
    })
  }
  expect(condition()).toBe(true)
}

describe('collaboration', () => {
  it('converges two clients editing the shared document', async () => {
    const { clientA, clientB } = await renderClientPair()

    await act(async () => {
      clientA.editor.commands.insertContentAt(0, '<p>from A</p>')
    })
    expect(clientA.dom.textContent).toContain('from A')
    expect(clientB.dom.textContent).toContain('from A')

    await act(async () => {
      clientB.editor.commands.insertContentAt(
        clientB.editor.state.doc.content.size,
        '<p>from B</p>',
      )
    })
    expect(clientA.dom.textContent).toContain('from B')
    // Cross-editor comparison must be structural: each editor has its own
    // Schema instance and node types compare by identity
    expect(clientA.editor.state.doc.toJSON()).toEqual(clientB.editor.state.doc.toJSON())
  })

  it('applies remote edits without remounting unchanged siblings', async () => {
    const { clientA, clientB } = await renderClientPair()

    await act(async () => {
      // setContent replaces the whole doc: exactly three paragraphs
      clientA.editor.commands.setContent('<p>one</p><p>two</p><p>three</p>')
    })

    const hostsBefore = Array.from(clientB.dom.querySelectorAll('p'))

    expect(hostsBefore).toHaveLength(3)

    // A remote edit inside "two": B updates the text in place
    await act(async () => {
      clientA.editor.commands.insertContentAt(6, 'X')
    })

    let hostsAfter = Array.from(clientB.dom.querySelectorAll('p'))

    expect(hostsAfter[1].textContent).toBe('Xtwo')
    hostsBefore.forEach((host, index) => expect(hostsAfter[index]).toBe(host))

    // A remote insert at the start shifts every position: keys must survive
    // the remap, so B's existing paragraphs keep their hosts
    await act(async () => {
      clientA.editor.commands.insertContentAt(0, '<p>zero</p>')
    })

    hostsAfter = Array.from(clientB.dom.querySelectorAll('p'))
    expect(hostsAfter).toHaveLength(4)
    expect(hostsAfter[0].textContent).toBe('zero')
    hostsBefore.forEach((host, index) => expect(hostsAfter[index + 1]).toBe(host))

    // A remote delete of "one" (6-11 after the zero insert) drops exactly
    // the removed paragraph's host
    await act(async () => {
      clientA.editor.commands.deleteRange({ from: 6, to: 11 })
    })

    hostsAfter = Array.from(clientB.dom.querySelectorAll('p'))
    expect(hostsAfter).toHaveLength(3)
    expect(hostsAfter.map(host => host.textContent)).toEqual(['zero', 'Xtwo', 'three'])
    expect(hostsAfter[1]).toBe(hostsBefore[1])
    expect(hostsAfter[2]).toBe(hostsBefore[2])
  })

  it('converges concurrent offline edits when the bridge flushes', async () => {
    const { docA, docB, link, clientA, clientB } = await renderClientPair(false)

    // Seed A and deliver the seed manually
    await act(async () => {
      clientA.editor.commands.insertContentAt(0, '<p>shared</p>')
      link.goLive()
    })
    expect(clientB.dom.textContent).toContain('shared')

    // Diverge: hold updates while both clients edit
    const offline = connectDocs(docA, docB, false)

    void offline

    await act(async () => {
      clientA.editor.commands.insertContentAt(1, 'A-')
    })
    await act(async () => {
      clientB.editor.commands.insertContentAt(clientB.editor.state.doc.content.size - 1, '-B')
    })

    // Both edits arrive on flush and the CRDT converges both clients
    await act(async () => {
      link.goLive()
    })

    expect(clientA.editor.state.doc.toJSON()).toEqual(clientB.editor.state.doc.toJSON())
    expect(clientA.dom.textContent).toBe(clientB.dom.textContent)
    expect(clientA.dom.textContent).toContain('A-')
    expect(clientA.dom.textContent).toContain('-B')
  })

  it('keeps collaborative undo scoped to the local client', async () => {
    const { clientA, clientB } = await renderClientPair()

    await act(async () => {
      clientA.editor.commands.insertContentAt(0, '<p>alpha</p>')
    })
    await act(async () => {
      clientB.editor.commands.insertContentAt(clientB.editor.state.doc.content.size, '<p>beta</p>')
    })

    // A undoes: only A's own edit reverts, B's survives on both clients
    await act(async () => {
      clientA.editor.commands.undo()
    })

    expect(clientA.editor.state.doc.textContent).toBe('beta')
    expect(clientB.editor.state.doc.textContent).toBe('beta')
    expect(clientB.dom.textContent).toContain('beta')
    expect(clientB.dom.textContent).not.toContain('alpha')
  })

  it('renders remote carets as widget decorations that follow the cursor', async () => {
    const docA = new Y.Doc()
    const docB = new Y.Doc()

    connectDocs(docA, docB)

    const awarenessA = new Awareness(docA)
    const awarenessB = new Awareness(docB)

    connectAwareness(awarenessA, awarenessB)

    const clientA = await renderCollabClient({
      ydoc: docA,
      awareness: awarenessA,
      user: { name: 'Alice', color: '#ff0000' },
    })
    const clientB = await renderCollabClient({
      ydoc: docB,
      awareness: awarenessB,
      user: { name: 'Bob', color: '#00ff00' },
    })

    await act(async () => {
      clientA.editor.commands.insertContentAt(0, '<p>hello world</p>')
    })

    // The cursor state only publishes while the view has focus; the cursor
    // plugin batches awareness-driven redecoration into a setTimeout(0)
    // tick, so assertions poll via waitFor
    await act(async () => {
      clientA.view.dom.focus()
      clientA.view.dispatch(
        clientA.view.state.tr.setSelection(TextSelection.create(clientA.view.state.doc, 3)),
      )
    })
    await waitFor(() => clientB.dom.querySelector('.collaboration-carets__caret') !== null)

    // Bob's client renders Alice's caret: a widget decoration hosted by the
    // renderer's widget span, using the caret extension's cursor builder
    const caret = clientB.dom.querySelector('.collaboration-carets__caret') as HTMLElement

    expect(caret).toBeTruthy()
    expect(caret.textContent).toContain('Alice')
    expect(caret.getAttribute('style')).toContain('#ff0000')

    // Sitting between "he" (pos 3) and "llo world", inside the widget host
    const host = caret.parentElement as HTMLElement

    expect(host.classList.contains('ProseMirror-widget')).toBe(true)
    expect(host.previousSibling?.nodeValue).toBe('he')
    expect(host.nextSibling?.nodeValue).toBe('llo world')

    // The caret follows the remote cursor
    await act(async () => {
      clientA.view.dispatch(
        clientA.view.state.tr.setSelection(TextSelection.create(clientA.view.state.doc, 6)),
      )
    })
    await waitFor(
      () =>
        clientB.dom.querySelector('.collaboration-carets__caret')?.parentElement?.previousSibling
          ?.nodeValue === 'hello',
    )

    // ...and disappears when the remote client goes away
    await act(async () => {
      awarenessA.setLocalState(null)
    })
    await waitFor(() => clientB.dom.querySelector('.collaboration-carets__caret') === null)

    // Alice never renders her own caret
    expect(clientA.dom.querySelector('.collaboration-carets__caret')).toBeNull()
  })
})
