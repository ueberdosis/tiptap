// @vitest-environment happy-dom

import { Editor } from '@tiptap/core'
import { Collaboration } from '@tiptap/extension-collaboration'
import StarterKit from '@tiptap/starter-kit'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'
import * as Y from 'yjs'

import { AiInsertReveal } from '../src/streaming-reveal.js'

const AI_CLIENT_ID = 111111
const HUMAN_CLIENT_ID = 222222

/** The awareness payload the Tiptap AI server publishes while it streams. */
const AI_USER = { name: 'AI', color: '#8B5CF6', aiInstanceId: 'ai-instance-1' }

/** Stands in for a collab provider, exposing only the awareness surface we read. */
function createProvider() {
  const states = new Map<number, Record<string, any>>()
  const listeners = new Set<() => void>()

  return {
    awareness: {
      getStates: () => states,
      on: (_event: string, listener: () => void) => listeners.add(listener),
      off: (_event: string, listener: () => void) => listeners.delete(listener),
    },
    announce(clientId: number, user: Record<string, any>) {
      states.set(clientId, { user })
      listeners.forEach(listener => listener())
    },
  }
}

/** Creates an editor with {@link AiInsertReveal} but no collaboration (no y-sync plugin). */
function createEditor(): Promise<Editor> {
  return new Promise(resolve => {
    const editor = new Editor({
      element: document.createElement('div'),
      extensions: [StarterKit, AiInsertReveal.configure({ provider: createProvider() })],
      content: {
        type: 'doc',
        content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] }],
      },
      onCreate: () => {
        resolve(editor)
      },
    })
  })
}

/** A remote peer that keeps its clientID across writes. */
function createPeer(ydoc: Y.Doc, clientID: number): Y.Doc {
  const peer = new Y.Doc()
  peer.clientID = clientID
  Y.applyUpdate(peer, Y.encodeStateAsUpdate(ydoc))
  return peer
}

/** Creates a collaborative editor seeded with one `Hello` paragraph, plus two remote peers. */
function createCollabEditor(options?: {
  durationMs?: number
}): Promise<{ editor: Editor; ydoc: Y.Doc; ai: Y.Doc; human: Y.Doc }> {
  const ydoc = new Y.Doc()
  const provider = createProvider()
  provider.announce(AI_CLIENT_ID, AI_USER)
  provider.announce(HUMAN_CLIENT_ID, { name: 'Someone else', color: '#0EA5E9' })

  return new Promise(resolve => {
    new Editor({
      element: document.createElement('div'),
      extensions: [
        StarterKit.configure({ undoRedo: false }),
        Collaboration.configure({ document: ydoc }),
        AiInsertReveal.configure({
          provider,
          ...(options?.durationMs === undefined ? {} : { durationMs: options.durationMs }),
        }),
      ],
      onCreate: ({ editor }) => {
        // Collaboration ignores the `content` prop (the empty Y.Doc wins when the
        // y-sync plugin binds), so seed the shared doc with a local edit instead.
        editor.commands.setContent('<p>Hello</p>')
        resolve({
          editor,
          ydoc,
          ai: createPeer(ydoc, AI_CLIENT_ID),
          human: createPeer(ydoc, HUMAN_CLIENT_ID),
        })
      },
    })
  })
}

/** Applies an insert from `peer`, so it lands as a remote transaction authored by it. */
function remoteInsert(peer: Y.Doc, ydoc: Y.Doc, index: number, text: string): void {
  Y.applyUpdate(peer, Y.encodeStateAsUpdate(ydoc, Y.encodeStateVector(peer)))
  const paragraph = peer.getXmlFragment('default').get(0) as Y.XmlElement
  const xmlText = paragraph.get(0) as Y.XmlText
  xmlText.insert(index, text)
  Y.applyUpdate(ydoc, Y.encodeStateAsUpdate(peer, Y.encodeStateVector(ydoc)))
}

/** Applies a whole new block from `peer`, the way the AI writes a fresh paragraph. */
function remoteInsertBlock(peer: Y.Doc, ydoc: Y.Doc, text: string): void {
  Y.applyUpdate(peer, Y.encodeStateAsUpdate(ydoc, Y.encodeStateVector(peer)))
  const fragment = peer.getXmlFragment('default')
  const block = new Y.XmlElement('paragraph')
  const blockText = new Y.XmlText()
  block.insert(0, [blockText])
  fragment.insert(0, [block])
  if (text.length > 0) blockText.insert(0, text)
  Y.applyUpdate(ydoc, Y.encodeStateAsUpdate(peer, Y.encodeStateVector(ydoc)))
}

/** Collects the extension's current reveal decorations, resolved against `state`. */
function revealDecorations(
  editor: Editor,
  state: unknown = editor.state,
): Array<{ from: number; to: number; style: string }> {
  for (const plugin of editor.state.plugins) {
    const set = (plugin as any).props?.decorations?.call(plugin, state)
    const found = (set?.find?.() ?? []).filter(
      (d: any) => d.type?.attrs?.class === 'ai-insert-reveal',
    )
    if (found.length > 0) {
      return found.map((d: any) => ({ from: d.from, to: d.to, style: d.type.attrs.style ?? '' }))
    }
  }
  return []
}

describe('AiInsertReveal', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('is a named Tiptap extension', () => {
    expect(AiInsertReveal.name).toBe('aiInsertReveal')
  })

  it('warns and degrades to a no-op when no collaboration y-sync plugin is present', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const editor = await createEditor()

    expect(editor.extensionManager.extensions.some(e => e.name === 'aiInsertReveal')).toBe(true)
    // Without a y-sync plugin the decorations source resolves to nothing, so the
    // editor renders normally rather than throwing.
    expect(editor.getText()).toBe('Hello')
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('Collaboration extension'))

    warn.mockRestore()
    editor.destroy()
  })

  it('applies configured className and durationMs', async () => {
    const editor = await new Promise<Editor>(resolve => {
      const created = new Editor({
        element: document.createElement('div'),
        extensions: [
          StarterKit,
          AiInsertReveal.configure({
            className: 'custom-reveal',
            durationMs: 300,
            provider: createProvider(),
          }),
        ],
        onCreate: () => resolve(created),
      })
    })

    const reveal = editor.extensionManager.extensions.find(e => e.name === 'aiInsertReveal')
    expect(reveal?.options).toMatchObject({ className: 'custom-reveal', durationMs: 300 })

    editor.destroy()
  })

  it('reveals a remote insert as a decoration over exactly the inserted run', async () => {
    const { editor, ydoc, ai } = await createCollabEditor()

    remoteInsert(ai, ydoc, 5, ' WORLD')

    expect(editor.getText()).toBe('Hello WORLD')
    const decorations = revealDecorations(editor)
    expect(decorations).toHaveLength(1)
    expect(decorations[0].to - decorations[0].from).toBe(' WORLD'.length)
    // The age-seeded animation-delay is present so the fade survives re-renders.
    expect(decorations[0].style).toMatch(/animation-delay: -\d+ms/)

    editor.destroy()
  })

  it('reveals a block that arrives as a whole new node', async () => {
    const { editor, ydoc, ai } = await createCollabEditor()

    remoteInsertBlock(ai, ydoc, 'A brand new title')

    const decorations = revealDecorations(editor)
    expect(decorations).toHaveLength(1)
    expect(decorations[0].to - decorations[0].from).toBe('A brand new title'.length)

    editor.destroy()
  })

  it('reveals text streamed into a block that was created empty', async () => {
    const { editor, ydoc, ai } = await createCollabEditor()

    remoteInsertBlock(ai, ydoc, '')
    remoteInsert(ai, ydoc, 0, 'Streamed title')

    const decorations = revealDecorations(editor)
    expect(decorations).toHaveLength(1)
    expect(decorations[0].to - decorations[0].from).toBe('Streamed title'.length)

    editor.destroy()
  })

  it('merges touching runs that share an animation offset into one decoration', async () => {
    const { editor, ydoc, ai } = await createCollabEditor()
    // Only the clock is faked: the editor is created through a real `setTimeout`.
    vi.useFakeTimers({ toFake: ['Date'] })

    remoteInsert(ai, ydoc, 5, ' one')
    remoteInsert(ai, ydoc, 9, ' two')

    expect(editor.getText()).toBe('Hello one two')
    const decorations = revealDecorations(editor)
    expect(decorations).toHaveLength(1)
    expect(decorations[0].to - decorations[0].from).toBe(' one two'.length)

    editor.destroy()
  })

  it('reveals an insert at the very end of the document', async () => {
    const { editor, ydoc, ai } = await createCollabEditor()

    remoteInsert(ai, ydoc, 5, '!')

    expect(editor.getText()).toBe('Hello!')
    const decorations = revealDecorations(editor)
    expect(decorations).toHaveLength(1)
    expect(decorations[0].to - decorations[0].from).toBe(1)
    expect(decorations[0].to).toBeLessThanOrEqual(editor.state.doc.content.size)

    editor.destroy()
  })

  it('clamps a decoration that resolves past the end of the document', async () => {
    const { editor, ydoc, ai } = await createCollabEditor()

    remoteInsert(ai, ydoc, 5, ' WORLD')
    expect(revealDecorations(editor)).toHaveLength(1)

    // Y.Doc can be ahead of the PM doc mid-sync, so resolve against a shorter doc.
    const shortDoc = editor.schema.nodeFromJSON({
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello!' }] }],
    })
    const decorations = revealDecorations(editor, { ...editor.state, doc: shortDoc })

    expect(decorations).toHaveLength(1)
    expect(decorations[0].to).toBe(shortDoc.content.size)

    editor.destroy()
  })

  it("does not reveal another collaborator's remote insert", async () => {
    const { editor, ydoc, human } = await createCollabEditor()

    remoteInsert(human, ydoc, 5, ' WORLD')

    // The insert lands like any remote edit, it just must not fade.
    expect(editor.getText()).toBe('Hello WORLD')
    expect(revealDecorations(editor)).toHaveLength(0)

    editor.destroy()
  })

  it('reveals the AI while a collaborator types alongside it', async () => {
    const { editor, ydoc, ai, human } = await createCollabEditor()

    remoteInsert(human, ydoc, 5, ' HUMAN')
    remoteInsert(ai, ydoc, 11, ' AI')

    expect(editor.getText()).toBe('Hello HUMAN AI')
    const decorations = revealDecorations(editor)
    expect(decorations).toHaveLength(1)
    expect(decorations[0].to - decorations[0].from).toBe(' AI'.length)

    editor.destroy()
  })

  it('reveals a run that arrived before awareness identified the AI', async () => {
    const ydoc = new Y.Doc()
    const provider = createProvider()

    const editor = await new Promise<Editor>(resolve => {
      new Editor({
        element: document.createElement('div'),
        extensions: [
          StarterKit.configure({ undoRedo: false }),
          Collaboration.configure({ document: ydoc }),
          AiInsertReveal.configure({ provider }),
        ],
        onCreate: ({ editor: created }) => {
          created.commands.setContent('<p>Hello</p>')
          resolve(created)
        },
      })
    })

    // The AI's first tokens can land before its awareness entry does.
    remoteInsert(createPeer(ydoc, AI_CLIENT_ID), ydoc, 5, ' WORLD')
    expect(revealDecorations(editor)).toHaveLength(0)

    provider.announce(AI_CLIENT_ID, AI_USER)

    expect(revealDecorations(editor)).toHaveLength(1)

    editor.destroy()
  })

  it('reveals a multi-block structure the AI writes as one node', async () => {
    const { editor, ydoc, ai } = await createCollabEditor()

    Y.applyUpdate(ai, Y.encodeStateAsUpdate(ydoc, Y.encodeStateVector(ai)))
    const list = new Y.XmlElement('bulletList')
    for (let item = 0; item < 3; item++) {
      const listItem = new Y.XmlElement('listItem')
      const paragraph = new Y.XmlElement('paragraph')
      const text = new Y.XmlText()
      paragraph.insert(0, [text])
      listItem.insert(0, [paragraph])
      list.insert(list.length, [listItem])
      text.insert(0, `Item ${item}`)
    }
    ai.getXmlFragment('default').insert(0, [list])
    Y.applyUpdate(ydoc, Y.encodeStateAsUpdate(ai, Y.encodeStateVector(ydoc)))

    // One structure, so the block cap must not mistake it for a document sync.
    expect(revealDecorations(editor)).toHaveLength(3)

    editor.destroy()
  })

  it('reveals nothing when a whole AI-authored document arrives at once', async () => {
    const ydoc = new Y.Doc()
    const provider = createProvider()
    provider.announce(AI_CLIENT_ID, AI_USER)

    const editor = await new Promise<Editor>(resolve => {
      const created = new Editor({
        element: document.createElement('div'),
        extensions: [
          StarterKit.configure({ undoRedo: false }),
          Collaboration.configure({ document: ydoc }),
          AiInsertReveal.configure({ provider }),
        ],
        onCreate: () => resolve(created),
      })
    })

    // Joining a room hands over everything the AI wrote before, in one update.
    const server = new Y.Doc()
    server.clientID = AI_CLIENT_ID
    const fragment = server.getXmlFragment('default')
    for (let block = 0; block < 5; block++) {
      const element = new Y.XmlElement('paragraph')
      const text = new Y.XmlText()
      element.insert(0, [text])
      fragment.insert(fragment.length, [element])
      text.insert(0, `Paragraph ${block} written earlier by the AI.`)
    }
    Y.applyUpdate(ydoc, Y.encodeStateAsUpdate(server))

    expect(editor.getText().length).toBeGreaterThan(0)
    expect(revealDecorations(editor)).toHaveLength(0)

    editor.destroy()
  })

  it('warns when the provider has no awareness', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const editor = await new Promise<Editor>(resolve => {
      const created = new Editor({
        element: document.createElement('div'),
        extensions: [StarterKit, AiInsertReveal.configure({ provider: {} })],
        onCreate: () => resolve(created),
      })
    })

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('no awareness'))

    warn.mockRestore()
    editor.destroy()
  })

  it('warns when durationMs cannot hold a reveal', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const editor = await new Promise<Editor>(resolve => {
      const created = new Editor({
        element: document.createElement('div'),
        extensions: [
          StarterKit,
          AiInsertReveal.configure({ provider: createProvider(), durationMs: 0 }),
        ],
        onCreate: () => resolve(created),
      })
    })

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('durationMs'))

    warn.mockRestore()
    editor.destroy()
  })

  it('warns and reveals nothing when no provider is configured', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const ydoc = new Y.Doc()

    const editor = await new Promise<Editor>(resolve => {
      new Editor({
        element: document.createElement('div'),
        extensions: [
          StarterKit.configure({ undoRedo: false }),
          Collaboration.configure({ document: ydoc }),
          AiInsertReveal,
        ],
        onCreate: ({ editor: created }) => {
          created.commands.setContent('<p>Hello</p>')
          resolve(created)
        },
      })
    })

    remoteInsert(createPeer(ydoc, AI_CLIENT_ID), ydoc, 5, ' WORLD')

    // Without awareness the AI cannot be identified, so it fails closed.
    expect(editor.getText()).toBe('Hello WORLD')
    expect(revealDecorations(editor)).toHaveLength(0)
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('"provider" option is required'))

    warn.mockRestore()
    editor.destroy()
  })

  it("does not reveal the local user's own typing", async () => {
    const { editor } = await createCollabEditor()

    // A local transaction (transaction.local === true) must be ignored.
    editor.commands.insertContentAt(6, 'X')

    expect(editor.getText()).toBe('HelloX')
    expect(revealDecorations(editor)).toHaveLength(0)

    editor.destroy()
  })

  it('drops the reveal once its duration has elapsed', async () => {
    const { editor, ydoc, ai } = await createCollabEditor({ durationMs: 30 })
    vi.useFakeTimers({ toFake: ['Date'] })

    remoteInsert(ai, ydoc, 5, ' WORLD')
    expect(revealDecorations(editor)).toHaveLength(1)

    vi.setSystemTime(Date.now() + 60)
    expect(revealDecorations(editor)).toHaveLength(0)

    editor.destroy()
  })

  it('clamps a run longer than the max reveal range to that many characters', async () => {
    const { editor, ydoc, ai } = await createCollabEditor()

    remoteInsert(ai, ydoc, 5, 'x'.repeat(401))

    expect(editor.getText()).toBe(`Hello${'x'.repeat(401)}`)
    const decorations = revealDecorations(editor)
    expect(decorations).toHaveLength(1)
    // The whole run inserts; only the fade is capped (MAX_REVEAL_RANGE = 400).
    expect(decorations[0].to - decorations[0].from).toBe(400)

    editor.destroy()
  })

  it('drops a run whose resolved span no longer matches its inserted length', async () => {
    const { editor, ydoc, ai } = await createCollabEditor()

    remoteInsert(ai, ydoc, 5, ' WORLD')
    // 'XYZ' lands inside the first run, so its span drifts from 6 to 9 and drops as stale.
    remoteInsert(ai, ydoc, 8, 'XYZ')

    const decorations = revealDecorations(editor)
    expect(decorations).toHaveLength(1)
    expect(decorations[0].to - decorations[0].from).toBe(3)

    editor.destroy()
  })

  it('tears down cleanly after a reveal without throwing', async () => {
    const { editor, ydoc, ai } = await createCollabEditor()
    remoteInsert(ai, ydoc, 5, ' WORLD')
    expect(revealDecorations(editor)).toHaveLength(1)

    expect(() => editor.destroy()).not.toThrow()
  })
})
