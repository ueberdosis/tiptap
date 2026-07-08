import type { Node as ProseMirrorNode } from '@tiptap/pm/model'
import { EditorState } from '@tiptap/pm/state'
import type { Transaction } from '@tiptap/pm/state'
import { describe, expect, it } from 'vitest'

import { reorderSiblings } from '../commands/reorderSiblings.js'
import type { ReactKeysPluginMeta, ReactKeysPluginState } from '../plugins/reactKeys.js'
import { reactKeys, reactKeysPluginKey } from '../plugins/reactKeys.js'
import { bq, doc, p, testSchema } from './helpers.js'

const createState = (docNode: ProseMirrorNode) =>
  EditorState.create({ doc: docNode, plugins: [reactKeys()] })

const getKeys = (state: EditorState): ReactKeysPluginState =>
  reactKeysPluginKey.getState(state) as ReactKeysPluginState

const applyTr = (state: EditorState, build: (tr: Transaction) => Transaction) =>
  state.apply(build(state.tr))

describe('reactKeys plugin', () => {
  it('assigns a key to every node on init, text included', () => {
    // Positions: blockquote 0, inner paragraph 1, its text 2,
    // sibling paragraph 7, its text 8
    const state = createState(doc(bq(p('foo')), p('bar')))
    const { posToKey, keyToPos } = getKeys(state)

    expect([...posToKey.keys()].sort((a, b) => a - b)).toEqual([0, 1, 2, 7, 8])
    expect(new Set(posToKey.values()).size).toBe(5)
    for (const [pos, key] of posToKey) {
      expect(keyToPos.get(key)).toBe(pos)
    }
  })

  it('carries keys through typing, shifting later siblings', () => {
    const state = createState(doc(p('foo'), p('bar')))
    const [key1, key2] = [getKeys(state).posToKey.get(0), getKeys(state).posToKey.get(5)]

    const next = applyTr(state, tr => tr.insertText('x', 2))

    expect(getKeys(next).posToKey.get(0)).toBe(key1)
    expect(getKeys(next).posToKey.get(6)).toBe(key2)
    expect(getKeys(next).posToKey.size).toBe(4)
  })

  it('keeps the left key and mints a fresh right key on split', () => {
    const state = createState(doc(p('abcd')))
    const leftKey = getKeys(state).posToKey.get(0)

    const next = applyTr(state, tr => tr.split(3))
    const { posToKey } = getKeys(next)

    // Result: <p>ab</p> at 0, <p>cd</p> at 4
    expect(posToKey.get(0)).toBe(leftKey)
    expect(posToKey.get(4)).toBeDefined()
    expect(posToKey.get(4)).not.toBe(leftKey)
  })

  it('keeps the first key deterministically on join', () => {
    const state = createState(doc(p('ab'), p('cd')))
    const [key1, key2] = [getKeys(state).posToKey.get(0), getKeys(state).posToKey.get(4)] as [
      string,
      string,
    ]

    const next = applyTr(state, tr => tr.join(4))
    const { posToKey, keyToPos } = getKeys(next)

    expect(posToKey.get(0)).toBe(key1)
    expect(keyToPos.has(key2)).toBe(false)
  })

  it('keeps keyToPos the exact inverse of posToKey under collisions', () => {
    const state = createState(doc(p('a'), p('b')))

    // Force both paragraphs onto position 0 through overrides
    const next = applyTr(state, tr =>
      tr.insertText('x', 1).setMeta(reactKeysPluginKey, {
        overrides: new Map([
          [0, 0],
          [3, 0],
        ]),
      } satisfies ReactKeysPluginMeta),
    )
    const { posToKey, keyToPos } = getKeys(next)

    expect(keyToPos.size).toBe(posToKey.size)
    for (const [pos, key] of posToKey) {
      expect(keyToPos.get(key)).toBe(pos)
    }
  })

  it('returns the same state object for transactions without doc changes', () => {
    const state = createState(doc(p('foo')))
    const next = applyTr(state, tr => tr.setMeta('decoration-only', true))

    expect(getKeys(next)).toBe(getKeys(state))
  })

  it('preserves keys across a reorder, including descendants', () => {
    // Positions: blockquote 0, inner paragraph 1, <p>b</p> 5, <p>c</p> 8
    const state = createState(doc(bq(p('a')), p('b'), p('c')))
    const before = getKeys(state).posToKey
    const [bqKey, innerKey, bKey, cKey] = [0, 1, 5, 8].map(pos => before.get(pos))

    let next = state

    // Move the blockquote to the end: new order is b, c, blockquote
    reorderSiblings(0, [1, 2, 0])(state, tr => {
      next = state.apply(tr)
    })

    // Result: <p>b</p> 0, <p>c</p> 3, blockquote 6, inner paragraph 7
    const { posToKey } = getKeys(next)

    expect(posToKey.get(0)).toBe(bKey)
    expect(posToKey.get(3)).toBe(cKey)
    expect(posToKey.get(6)).toBe(bqKey)
    expect(posToKey.get(7)).toBe(innerKey)
  })

  it('rejects invalid reorder input', () => {
    const state = createState(doc(p('a'), p('b')))

    // Not a parent content start
    expect(reorderSiblings(1, [1, 0])(state)).toBe(false)
    // Wrong length and not a permutation
    expect(reorderSiblings(0, [0])(state)).toBe(false)
    expect(reorderSiblings(0, [0, 0])(state)).toBe(false)
    expect(reorderSiblings(0, [0.5, 1.5])(state)).toBe(false)
    // Valid order, no dispatch: applicable
    expect(reorderSiblings(0, [1, 0])(state)).toBe(true)
  })

  it('fails instead of throwing when the order violates the content expression', () => {
    // section requires exactly paragraph-then-blockquote
    const state = createState(doc(testSchema.node('section', null, [p('a'), bq(p('b'))])))

    expect(reorderSiblings(1, [1, 0])(state)).toBe(false)
    expect(() =>
      reorderSiblings(1, [1, 0])(state, () => {
        throw new Error('must not dispatch')
      }),
    ).not.toThrow()
  })

  describe('freezeFrom', () => {
    const setFreeze = (state: EditorState, freezeFrom: number | null) =>
      applyTr(state, tr =>
        tr.setMeta(reactKeysPluginKey, { freezeFrom } satisfies ReactKeysPluginMeta),
      )

    it('is set and cleared through meta', () => {
      const state = createState(doc(p('ab'), p('cd')))
      const frozen = setFreeze(state, 4)

      expect(getKeys(frozen).freezeFrom).toBe(4)
      expect(getKeys(setFreeze(frozen, null)).freezeFrom).toBe(null)
    })

    it('maps forward when other content changes', () => {
      const state = setFreeze(createState(doc(p('ab'), p('cd'))), 4)
      const next = applyTr(state, tr => tr.insertText('x', 1))

      expect(getKeys(next).freezeFrom).toBe(5)
    })

    it('clears when the frozen block changes outside composition', () => {
      const state = setFreeze(createState(doc(p('ab'), p('cd'))), 4)
      const next = applyTr(state, tr => tr.insertText('x', 6))

      expect(getKeys(next).freezeFrom).toBe(null)
    })

    it('holds when the frozen block changes during composition', () => {
      const state = setFreeze(createState(doc(p('ab'), p('cd'))), 4)
      const next = applyTr(state, tr => tr.insertText('x', 6).setMeta('composition', true))

      expect(getKeys(next).freezeFrom).toBe(4)
    })

    it('clears when the frozen block is deleted', () => {
      const state = setFreeze(createState(doc(p('ab'), p('cd'))), 4)
      const next = applyTr(state, tr => tr.delete(4, 8))

      expect(getKeys(next).freezeFrom).toBe(null)
    })

    it('honors an explicit meta value over the staleness check', () => {
      const state = setFreeze(createState(doc(p('ab'), p('cd'))), 0)

      // Move the freeze onto the second paragraph while also editing it
      const next = applyTr(state, tr =>
        tr
          .insertText('x', 6)
          .setMeta(reactKeysPluginKey, { freezeFrom: 4 } satisfies ReactKeysPluginMeta),
      )

      expect(getKeys(next).freezeFrom).toBe(4)
    })
  })
})
