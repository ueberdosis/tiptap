/**
 * Fixture: doc > paragraph > text("hello").
 *
 *     <div class="editor">     ← docDesc
 *       <p>                    ← paraDesc
 *         #text("hello")       ← textDesc
 *
 * Doc positions: 0 (before p), 1 (start of "hello"), 2..5, 6 (end), 7 (after p).
 */

import { type Node as PMNode, Schema } from '@tiptap/pm/model'
import { type DecorationSource, DecorationSet } from '@tiptap/pm/view'
import { beforeEach, describe, expect, it } from 'vitest'

import { ReactNodeViewDesc, ReactTextViewDesc } from './index.js'

const schema = new Schema({
  nodes: {
    doc: { content: 'block+' },
    paragraph: { group: 'block', content: 'text*' },
    text: { group: 'inline' },
  },
})

interface Fixture {
  doc: PMNode
  editorEl: HTMLDivElement
  pEl: HTMLParagraphElement
  textNode: Text
  docDesc: ReactNodeViewDesc
  paraDesc: ReactNodeViewDesc
  textDesc: ReactTextViewDesc
}

function buildFixture(): Fixture {
  const text = schema.text('hello')
  const paragraph = schema.nodes.paragraph!.create(null, [text])
  const doc = schema.nodes.doc!.create(null, [paragraph])

  const editorEl = document.createElement('div')
  const pEl = document.createElement('p')
  const textNode = document.createTextNode('hello')
  pEl.appendChild(textNode)
  editorEl.appendChild(pEl)

  const innerDeco: DecorationSource = DecorationSet.empty

  const docDesc = new ReactNodeViewDesc(undefined, [], doc, [], innerDeco, editorEl, editorEl, editorEl)
  const paraDesc = new ReactNodeViewDesc(docDesc, [], paragraph, [], innerDeco, pEl, pEl, pEl)
  const textDesc = new ReactTextViewDesc(paraDesc, text, [], innerDeco, textNode, textNode)

  docDesc.children.push(paraDesc)
  paraDesc.children.push(textDesc)

  return { doc, editorEl, pEl, textNode, docDesc, paraDesc, textDesc }
}

describe('ReactViewDesc — position getters', () => {
  let fx: Fixture
  beforeEach(() => {
    fx = buildFixture()
  })

  it('paragraph size = 2 borders + 5 chars', () => {
    expect(fx.paraDesc.size).toBe(7)
    expect(fx.docDesc.size).toBe(fx.doc.nodeSize)
  })

  it('posAtStart sits inside the paragraph border', () => {
    expect(fx.paraDesc.posAtStart).toBe(1)
    expect(fx.paraDesc.posAtEnd).toBe(6)
    expect(fx.paraDesc.posBefore).toBe(0)
    expect(fx.paraDesc.posAfter).toBe(7)
  })

  it('positions thread through nested descs', () => {
    expect(fx.textDesc.posAtStart).toBe(1)
    expect(fx.textDesc.posAtEnd).toBe(6)
  })
})

describe('ReactViewDesc — descAt / domFromPos / posFromDOM', () => {
  let fx: Fixture
  beforeEach(() => {
    fx = buildFixture()
  })

  it('descAt(0) returns the paragraph desc', () => {
    expect(fx.docDesc.descAt(0)).toBe(fx.paraDesc)
  })

  it('descAt(1) returns the text desc', () => {
    expect(fx.docDesc.descAt(1)).toBe(fx.textDesc)
  })

  it('domFromPos lands inside the text node', () => {
    const { node, offset } = fx.docDesc.domFromPos(3, 0)
    expect(node).toBe(fx.textNode)
    expect(offset).toBe(2)
  })

  it('domFromPos at a paragraph boundary uses contentDOM', () => {
    const { node, offset } = fx.docDesc.domFromPos(0, 0)
    expect(node).toBe(fx.editorEl)
    expect(offset).toBe(0)
  })

  it('round-trip: posFromDOM(domFromPos(p)) === p', () => {
    for (let pos = 1; pos <= 6; pos += 1) {
      const { node, offset } = fx.docDesc.domFromPos(pos, 0)
      expect(fx.docDesc.posFromDOM(node, offset, 0)).toBe(pos)
    }
  })

  it('posFromDOM returns -1 for DOM outside the subtree', () => {
    const stray = document.createElement('span')
    expect(fx.docDesc.posFromDOM(stray, 0, 0)).toBe(-1)
  })
})

describe('ReactViewDesc — nearestDesc', () => {
  let fx: Fixture
  beforeEach(() => {
    fx = buildFixture()
  })

  it('finds the text desc from a text node', () => {
    expect(fx.docDesc.nearestDesc(fx.textNode)).toBe(fx.textDesc)
  })

  it('finds the paragraph desc from <p>', () => {
    expect(fx.docDesc.nearestDesc(fx.pEl)).toBe(fx.paraDesc)
  })

  it('returns undefined for DOM outside the tree', () => {
    const stray = document.createElement('span')
    expect(fx.docDesc.nearestDesc(stray)).toBeUndefined()
  })

  it('onlyNodes still returns the paragraph for <p>', () => {
    expect(fx.docDesc.nearestDesc(fx.pEl, true)).toBe(fx.paraDesc)
  })
})

describe('ReactViewDesc — localPosFromDOM bias', () => {
  let fx: Fixture
  beforeEach(() => {
    fx = buildFixture()
  })

  it('negative bias snaps to the position before the child', () => {
    expect(fx.paraDesc.localPosFromDOM(fx.pEl, 1, -1)).toBe(6)
  })

  it('positive bias at offset 0 snaps to posAtStart', () => {
    expect(fx.paraDesc.localPosFromDOM(fx.pEl, 0, 1)).toBe(1)
  })

  it('text desc translates character offsets directly', () => {
    expect(fx.textDesc.localPosFromDOM(fx.textNode, 0, 0)).toBe(1)
    expect(fx.textDesc.localPosFromDOM(fx.textNode, 5, 0)).toBe(6)
  })
})

describe('ReactViewDesc — getters', () => {
  let fx: Fixture
  beforeEach(() => {
    fx = buildFixture()
  })

  it('non-leaf node descs have border 1', () => {
    expect(fx.paraDesc.border).toBe(1)
  })

  it('text descs have border 0', () => {
    expect(fx.textDesc.border).toBe(0)
  })

  it('paragraph and text are not atoms', () => {
    expect(fx.paraDesc.domAtom).toBe(false)
    expect(fx.textDesc.domAtom).toBe(false)
  })

  it('pmViewDesc back-pointer is set on the DOM', () => {
    expect(fx.textNode.pmViewDesc).toBe(fx.textDesc)
    expect(fx.pEl.pmViewDesc).toBe(fx.paraDesc)
    expect(fx.editorEl.pmViewDesc).toBe(fx.docDesc)
  })
})

describe('ReactViewDesc — destroy', () => {
  it('clears back-pointers and recurses', () => {
    const fx = buildFixture()
    fx.docDesc.destroy()
    expect(fx.textNode.pmViewDesc).toBeUndefined()
    expect(fx.pEl.pmViewDesc).toBeUndefined()
    expect(fx.editorEl.pmViewDesc).toBeUndefined()
  })
})

describe('ReactViewDesc — write methods are no-ops', () => {
  let fx: Fixture
  beforeEach(() => {
    fx = buildFixture()
  })

  it('markDirty flips the flag without touching the DOM', () => {
    const before = fx.editorEl.innerHTML
    fx.textDesc.markDirty(0, 1)
    expect(fx.textDesc.dirty).toBeGreaterThan(0)
    expect(fx.editorEl.innerHTML).toBe(before)
  })

  it('markParentsDirty walks up', () => {
    fx.textDesc.markParentsDirty()
    expect(fx.paraDesc.dirty).toBeGreaterThan(0)
    expect(fx.docDesc.dirty).toBeGreaterThan(0)
  })
})

describe('ReactViewDesc — parseRange / emptyChildAt', () => {
  let fx: Fixture
  beforeEach(() => {
    fx = buildFixture()
  })

  it('parseRange descends into the paragraph for inner ranges', () => {
    const range = fx.docDesc.parseRange(2, 4)
    expect(range.node).toBe(fx.pEl)
  })

  it('emptyChildAt is false when content exists at the edge', () => {
    expect(fx.paraDesc.emptyChildAt(-1)).toBe(false)
    expect(fx.paraDesc.emptyChildAt(1)).toBe(false)
  })
})
