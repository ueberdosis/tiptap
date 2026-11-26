import { EditorState, TextSelection } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { ySyncPlugin } from '@tiptap/y-tiptap'
import { afterEach, describe, expect, it } from 'vite-plus/test'
import * as Y from 'yjs'
import { schema } from '../utils/testSchema.js'
import { syncDocuments } from '../utils/syncDocuments.js'

const tick = () => new Promise<void>(resolve => setTimeout(resolve, 0))

describe('two clients typing in the same empty paragraph', () => {
  const documents: Y.Doc[] = []
  const views: EditorView[] = []

  afterEach(() => {
    views.forEach(view => view.destroy())
    documents.forEach(document => document.destroy())
    views.length = 0
    documents.length = 0
  })

  const createClient = () => {
    const document = new Y.Doc()
    documents.push(document)
    const view = new EditorView(null, {
      state: EditorState.create({
        schema,
        plugins: [ySyncPlugin(document.getXmlFragment('prosemirror'))],
      }),
    })
    views.push(view)
    return { document, view }
  }

  const toEnd = (view: EditorView) =>
    view.dispatch(view.state.tr.setSelection(TextSelection.atEnd(view.state.doc)))

  // Two clients that share one line of text and one new EMPTY paragraph,
  // both with the cursor at its end.
  const createTwoClientsInEmptyParagraph = () => {
    const clientA = createClient()
    const clientB = createClient()

    toEnd(clientA.view)
    clientA.view.dispatch(clientA.view.state.tr.insertText('Base line.'))
    const split = clientA.view.state.tr
    split.split(split.selection.from)
    clientA.view.dispatch(split)
    syncDocuments(clientA.document, clientB.document)

    toEnd(clientA.view)
    toEnd(clientB.view)

    return { clientA, clientB }
  }

  // Two clients type at the same time in one shared empty paragraph, with a
  // wire that delivers each update `latency` keystrokes later. Returns the
  // last paragraph on both sides once every update is delivered.
  const run = async (a: string, b: string, latency: number) => {
    const { clientA, clientB } = createTwoClientsInEmptyParagraph()
    const { document: docA, view: va } = clientA
    const { document: docB, view: vb } = clientB

    const wire: { to: Y.Doc; update: Uint8Array; at: number }[] = []
    let step = 0
    const capture = (to: Y.Doc) => (update: Uint8Array, origin: unknown) => {
      if (origin !== 'net') wire.push({ to, update, at: step })
    }
    docA.on('update', capture(docB))
    docB.on('update', capture(docA))

    const deliver = async (all: boolean) => {
      for (let i = 0; i < wire.length;) {
        if (all || step - wire[i].at >= latency) {
          const [message] = wire.splice(i, 1)
          Y.applyUpdate(message.to, message.update, 'net')
          await tick()
        } else {
          i += 1
        }
      }
    }

    for (; step < Math.max(a.length, b.length); step += 1) {
      if (step < a.length) va.dispatch(va.state.tr.insertText(a[step]))
      if (step < b.length) vb.dispatch(vb.state.tr.insertText(b[step]))
      await tick()
      await deliver(false)
    }

    for (let i = 0; i < 8; i += 1) {
      await deliver(true)
      await tick()
    }

    return {
      a: va.state.doc.lastChild?.textContent ?? '',
      b: vb.state.doc.lastChild?.textContent ?? '',
    }
  }

  const expectJoined = (result: { a: string; b: string }, a: string, b: string) => {
    expect(result.a).toBe(result.b)
    expect([a + b, b + a]).toContain(result.a)
  }

  // The issue's criterion for the larger run: both sides agree and no
  // character is gained or lost. Concurrent inserts may still interleave.
  const expectNoGainOrLoss = (result: { a: string; b: string }, a: string, b: string) => {
    expect(result.a).toBe(result.b)
    expect(result.a.length).toBe(a.length + b.length)
    expect([...result.a].sort().join('')).toBe([...(a + b)].sort().join(''))
  }

  it('keeps the exact text from the issue example', async () => {
    const result = await run('first person writes here', 'second', 1)
    expectJoined(result, 'first person writes here', 'second')
  })

  it.each([
    { a: 'first person writes here', b: 'second', latency: 0 },
    { a: 'first person writes here', b: 'second', latency: 1 },
    { a: 'first person writes here', b: 'second', latency: 2 },
    { a: 'first person writes here', b: 'second', latency: 3 },
    { a: 'first person writes here', b: 'second', latency: 5 },
    { a: 'the quick brown fox', b: 'lazy dog', latency: 0 },
    { a: 'the quick brown fox', b: 'lazy dog', latency: 1 },
    { a: 'the quick brown fox', b: 'lazy dog', latency: 2 },
    { a: 'the quick brown fox', b: 'lazy dog', latency: 3 },
    { a: 'the quick brown fox', b: 'lazy dog', latency: 5 },
    { a: 'one', b: 'two three four five', latency: 0 },
    { a: 'one', b: 'two three four five', latency: 1 },
    { a: 'one', b: 'two three four five', latency: 2 },
    { a: 'one', b: 'two three four five', latency: 3 },
    { a: 'one', b: 'two three four five', latency: 5 },
  ])('keeps "$a" + "$b" exact with $latency keystroke delay', async ({ a, b, latency }) => {
    const result = await run(a, b, latency)
    expectJoined(result, a, b)
  })

  it('gains no character in a larger randomized run', async () => {
    // Deterministic seed so a failure reproduces.
    let seed = 8816
    const next = () => {
      seed = (seed * 1103515245 + 12345) % 2147483648
      return seed / 2147483648
    }
    const word = (length: number) =>
      Array.from({ length }, () => String.fromCharCode(97 + Math.floor(next() * 26))).join('')

    for (let round = 0; round < 196; round += 1) {
      const a = word(1 + Math.floor(next() * 12))
      const b = word(1 + Math.floor(next() * 12))
      const latency = Math.floor(next() * 6)
      const result = await run(a, b, latency)
      expectNoGainOrLoss(result, a, b)
    }
  }, 30000)

  it('keeps marks in place when they span sibling text types', async () => {
    const { clientA, clientB } = createTwoClientsInEmptyParagraph()
    const { document: docA, view: va } = clientA
    const { document: docB, view: vb } = clientB

    const wire: { to: Y.Doc; update: Uint8Array }[] = []
    const capture = (to: Y.Doc) => (update: Uint8Array, origin: unknown) => {
      if (origin !== 'net') wire.push({ to, update })
    }
    docA.on('update', capture(docB))
    docB.on('update', capture(docA))
    const deliver = async () => {
      for (const message of wire.splice(0)) {
        Y.applyUpdate(message.to, message.update, 'net')
        await tick()
      }
    }

    va.dispatch(va.state.tr.insertText('hello '))
    vb.dispatch(vb.state.tr.insertText('world'))
    await tick()
    await deliver()

    const joined = va.state.doc.lastChild?.textContent ?? ''
    expect(joined.length).toBe('hello world'.length)
    expect(vb.state.doc.lastChild?.textContent).toBe(joined)

    // Bold four characters across the sibling boundary, wherever it is.
    const paraStart = va.state.doc.content.size - (va.state.doc.lastChild?.nodeSize ?? 0)
    va.dispatch(
      va.state.tr.addMark(paraStart + 1 + 3, paraStart + 1 + 7, schema.marks.strong.create()),
    )
    await tick()
    await deliver()

    const expected = va.state.doc.lastChild?.toJSON()
    expect(vb.state.doc.lastChild?.toJSON()).toEqual(expected)

    // A new reader loads the same marked text from the shared document.
    const reader = createClient()
    Y.applyUpdate(reader.document, Y.encodeStateAsUpdate(docA))
    await tick()
    expect(reader.view.state.doc.lastChild?.toJSON()).toEqual(expected)
  })
})
