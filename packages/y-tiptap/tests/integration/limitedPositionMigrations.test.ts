import type { Node } from 'prosemirror-model'
import type { Transaction } from 'prosemirror-state'
import { Schema } from 'prosemirror-model'
import { EditorState, Plugin } from 'prosemirror-state'
import { canJoin, canSplit, findWrapping, liftTarget } from 'prosemirror-transform'
import { EditorView } from 'prosemirror-view'
import {
  absolutePositionToRelativePosition,
  relativePositionToAbsolutePosition,
  undo,
  ySyncPlugin,
  ySyncPluginKey,
  yUndoPlugin,
  yUndoPluginKey,
} from '@tiptap/y-tiptap'
import { describe, expect, it, vi } from 'vite-plus/test'
import * as Y from 'yjs'

const regions = vi.hoisted(() => ({ enabled: true, limited: 0 }))

vi.mock('../../src/lib/utils/positions/migrations/getPositionRegion.js', async importOriginal => {
  const actual =
    await importOriginal<
      typeof import('../../src/lib/utils/positions/migrations/getPositionRegion.js')
    >()

  return {
    getPositionRegion: (...args: Parameters<typeof actual.getPositionRegion>) => {
      const region = regions.enabled ? actual.getPositionRegion(...args) : null
      regions.limited += region ? 1 : 0
      return region
    },
  }
})

const schema = new Schema({
  nodes: {
    doc: { content: 'block+' },
    paragraph: {
      group: 'block',
      content: 'inline*',
      attrs: { align: { default: null } },
      toDOM: () => ['p', 0],
    },
    heading: { group: 'block', content: 'inline*', toDOM: () => ['h2', 0] },
    blockquote: { group: 'block', content: 'block+', toDOM: () => ['blockquote', 0] },
    bulletList: { group: 'block', content: 'listItem+', toDOM: () => ['ul', 0] },
    listItem: { content: 'paragraph block*', toDOM: () => ['li', 0] },
    image: { group: 'block', atom: true, attrs: { src: {} }, toDOM: node => ['img', node.attrs] },
    text: { group: 'inline' },
  },
  marks: { strong: { toDOM: () => ['strong', 0] } },
})

const words = ['alpha', 'beta', 'gamma', 'delta']

const createRandom = (seed: number) => {
  let state = seed
  return (size: number) => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0
    return state % size
  }
}

const createBlock = (random: (size: number) => number): Node => {
  const text = () => {
    const count = random(4)
    const value = Array.from({ length: count }, () => words[random(words.length)]).join(' ')
    return value ? [schema.text(value)] : []
  }
  const paragraph = () => schema.node('paragraph', null, text())

  switch (random(6)) {
    case 0:
      return schema.node('heading', null, text())
    case 1:
      return schema.node('blockquote', null, [paragraph(), paragraph()])
    case 2:
      return schema.node('bulletList', null, [schema.node('listItem', null, paragraph())])
    case 3:
      return schema.node('image', { src: `${random(2)}.png` })
    default:
      return paragraph()
  }
}

interface EditContext {
  random: (size: number) => number
  state: EditorState
  position: () => number
  child: () => { node: Node; offset: number }
}

const blockTypes = ['blockquote', 'bulletList'] as const

const edits: ((context: EditContext) => Transaction | null)[] = [
  ({ state, position }) => {
    const at = position()
    return canSplit(state.doc, at) ? state.tr.split(at) : null
  },
  ({ state, position }) => {
    const at = position()
    return canJoin(state.doc, at) ? state.tr.join(at) : null
  },
  ({ state, position, random }) => {
    const from = position()
    return state.tr.delete(from, Math.min(state.doc.content.size, from + random(12)))
  },
  ({ state, position, random }) => {
    const from = position()
    const to = Math.min(state.doc.content.size, from + random(15))
    return random(2)
      ? state.tr.addMark(from, to, schema.marks.strong.create())
      : state.tr.removeMark(from, to, schema.marks.strong)
  },
  ({ state, child }) => {
    const { node, offset } = child()
    const swap = { paragraph: schema.nodes.heading, heading: schema.nodes.paragraph }
    const type = swap[node.type.name as keyof typeof swap]
    return type ? state.tr.setNodeMarkup(offset, type) : null
  },
  ({ state, child }) => state.tr.insert(child().offset, child().node),
  ({ state, child }) => {
    const { node, offset } = child()
    const tr = state.tr.delete(offset, offset + node.nodeSize)
    return tr.insert(tr.mapping.map(child().offset), node)
  },
  ({ state, position, random }) => {
    const range = state.doc.resolve(position()).blockRange()
    const wrapping = range && findWrapping(range, schema.nodes[blockTypes[random(2)]])
    return range && wrapping ? state.tr.wrap(range, wrapping) : null
  },
  ({ state, position }) => {
    const range = state.doc.resolve(position()).blockRange()
    const target = range ? liftTarget(range) : null
    return range && typeof target === 'number' ? state.tr.lift(range, target) : null
  },
  ({ state, child, random }) => state.tr.insert(child().offset, createBlock(random)),
  ({ state, position, random }) => {
    const from = position()
    const slice = state.doc.slice(from, Math.min(state.doc.content.size, from + random(20)))
    return state.tr.replace(position(), undefined, slice)
  },
]

/** One random edit; invalid edits throw and are skipped the same way on both runs. */
const createEdit = (
  random: (size: number) => number,
  state: EditorState,
): Transaction | 'undo' | null => {
  const { doc } = state
  const child = () => {
    const index = random(doc.childCount)
    let offset = 0

    for (let current = 0; current < index; current += 1) {
      offset += doc.child(current).nodeSize
    }

    return { node: doc.child(index), offset }
  }
  const kind = random(edits.length + 1)

  if (kind === edits.length) {
    return 'undo'
  }

  return edits[kind]({ random, state, position: () => random(doc.content.size + 1), child })
}

// Appended transactions run before the view syncs, so their migrations are chained.
const appendEdits = new Plugin({
  appendTransaction: (transactions, _, state) => {
    const append = transactions.find(transaction => transaction.getMeta('append'))
    const edit = append ? createEdit(createRandom(append.getMeta('append')), state) : null
    return edit === 'undo' ? null : edit
  },
})

const applyRandomEdit = (view: EditorView, random: (size: number) => number) => {
  yUndoPluginKey.getState(view.state)!.undoManager.stopCapturing()
  let edit: ReturnType<typeof createEdit> = null

  try {
    edit = createEdit(random, view.state)
  } catch {
    return
  }

  if (edit === 'undo') {
    undo(view.state)
    return
  }

  if (edit?.docChanged) {
    if (random(4) === 0) edit.setMeta('append', random(1000) + 1)
    view.dispatch(edit)
  }
}

/** Runs one seeded editing session and returns the content and where every anchor resolves. */
const runSession = (seed: number, limited: boolean) => {
  regions.enabled = limited
  const random = createRandom(seed)
  const document = new Y.Doc()
  document.clientID = 1
  const fragment = document.getXmlFragment('prosemirror')
  const view = new EditorView(null, {
    state: EditorState.create({
      schema,
      plugins: [ySyncPlugin(fragment), yUndoPlugin(), appendEdits],
    }),
  })
  const content = Array.from({ length: 6 + random(10) }, () => createBlock(random))
  view.dispatch(view.state.tr.replaceWith(0, view.state.doc.content.size, content))
  const { mapping } = ySyncPluginKey.getState(view.state)!.binding
  const anchors: Y.RelativePosition[] = []

  for (let step = 0; step < 30; step += 1) {
    for (let position = 0; position <= view.state.doc.content.size; position += 1) {
      anchors.push(absolutePositionToRelativePosition(position, fragment, mapping))
    }

    applyRandomEdit(view, random)
  }

  const result = {
    doc: view.state.doc.toJSON(),
    shared: fragment.toString(),
    anchors: anchors.map(anchor =>
      relativePositionToAbsolutePosition(document, fragment, anchor, mapping),
    ),
  }
  view.destroy()
  document.destroy()
  return result
}

describe('limited position migrations', () => {
  it('resolve every anchor like a whole-document migration', { timeout: 60_000 }, () => {
    for (let seed = 1; seed <= 80; seed += 1) {
      const limited = runSession(seed, true)
      const whole = runSession(seed, false)

      expect({ seed, ...limited }).toEqual({ seed, ...whole })
    }

    expect(regions.limited).toBeGreaterThan(100)
  })
})
