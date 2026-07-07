import type { Node as ProseMirrorNode } from '@tiptap/pm/model'
import { EditorState } from '@tiptap/pm/state'
import type { Transaction } from '@tiptap/pm/state'
import { act, createElement } from 'react'
import { afterEach, describe, expect, it } from 'vitest'

import { reorderSiblings } from '../commands/reorderSiblings.js'
import { DocView } from '../components/DocView.js'
import { ReactKeysContext } from '../contexts/ReactKeysContext.js'
import { reactKeys, reactKeysPluginKey } from '../plugins/reactKeys.js'
import { bq, br, doc, mountTrackedRoot, p, unmountTrackedRoots } from './helpers.js'

afterEach(unmountTrackedRoots)

/** Renders a doc through DocView with reactKeys state provided via context. */
const renderEditor = async (docNode: ProseMirrorNode) => {
  let state = EditorState.create({ doc: docNode, plugins: [reactKeys()] })
  const { root, container } = mountTrackedRoot()

  const renderCurrent = async () => {
    await act(async () => {
      root.render(
        createElement(
          ReactKeysContext.Provider,
          { value: reactKeysPluginKey.getState(state) ?? null },
          createElement(DocView, { node: state.doc }),
        ),
      )
    })
  }

  await renderCurrent()

  const dispatch = async (tr: Transaction) => {
    state = state.apply(tr)
    await renderCurrent()
  }

  return {
    get dom() {
      return container.firstElementChild as HTMLDivElement
    },
    get state() {
      return state
    },
    dispatch,
    apply: (build: (tr: Transaction) => Transaction) => dispatch(build(state.tr)),
  }
}

/*
 * Remounts are detected through identity: a remounted NodeView creates both
 * a new host element and a new ViewDesc, while an updated one keeps both.
 */
describe('keyed transaction rendering', () => {
  it('does not remount siblings when typing in one paragraph', async () => {
    const editor = await renderEditor(doc(p('foo'), p('bar')))
    const [el1, el2] = [...editor.dom.children]
    const [desc1, desc2] = [el1.pmViewDesc, el2.pmViewDesc]

    await editor.apply(tr => tr.insertText('x', 2))

    expect(editor.dom.innerHTML).toBe('<p>fxoo</p><p>bar</p>')
    expect(editor.dom.children[0]).toBe(el1)
    expect(editor.dom.children[1]).toBe(el2)
    expect(editor.dom.children[0].pmViewDesc).toBe(desc1)
    expect(editor.dom.children[1].pmViewDesc).toBe(desc2)
  })

  it('keeps DOM text nodes when an element sibling is inserted before them', async () => {
    const editor = await renderEditor(doc(p('bar')))
    const textNode = editor.dom.children[0].firstChild

    await editor.apply(tr => tr.insert(1, br()))

    expect(editor.dom.innerHTML).toBe('<p><br>bar</p>')
    expect(editor.dom.children[0].lastChild).toBe(textNode)
  })

  it('keeps the left element and mounts a fresh right element on split', async () => {
    const editor = await renderEditor(doc(p('abcd')))
    const left = editor.dom.children[0]

    await editor.apply(tr => tr.split(3))

    expect(editor.dom.innerHTML).toBe('<p>ab</p><p>cd</p>')
    expect(editor.dom.children[0]).toBe(left)
    expect(editor.dom.children[1]).not.toBe(left)
  })

  it('keeps the first element on join', async () => {
    const editor = await renderEditor(doc(p('ab'), p('cd')))
    const [first, second] = [...editor.dom.children]

    await editor.apply(tr => tr.join(4))

    expect(editor.dom.innerHTML).toBe('<p>abcd</p>')
    expect(editor.dom.children[0]).toBe(first)
    expect(second.isConnected).toBe(false)
  })

  it('keeps all elements on a transaction without doc changes', async () => {
    const editor = await renderEditor(doc(p('foo'), p('bar')))
    const before = [...editor.dom.children]
    const keysBefore = reactKeysPluginKey.getState(editor.state)

    await editor.apply(tr => tr.setMeta('decoration-only', true))

    expect(reactKeysPluginKey.getState(editor.state)).toBe(keysBefore)
    expect([...editor.dom.children]).toEqual(before)
  })

  it('moves elements without remounting on reorderSiblings', async () => {
    const editor = await renderEditor(doc(bq(p('a')), p('b'), p('c')))
    const [bqEl, bEl, cEl] = [...editor.dom.children]
    const innerEl = bqEl.children[0]

    let reorderTr: Transaction | undefined

    // Move the blockquote to the end: new order is b, c, blockquote
    reorderSiblings(0, [1, 2, 0])(editor.state, tr => {
      reorderTr = tr
    })
    await editor.dispatch(reorderTr as Transaction)

    expect(editor.dom.innerHTML).toBe(
      '<p>b</p><p>c</p><blockquote class="quote" data-kind="note"><p>a</p></blockquote>',
    )
    expect(editor.dom.children[0]).toBe(bEl)
    expect(editor.dom.children[1]).toBe(cEl)
    expect(editor.dom.children[2]).toBe(bqEl)
    expect(editor.dom.children[2].children[0]).toBe(innerEl)
  })
})
