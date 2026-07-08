import type { Node as ProseMirrorNode } from '@tiptap/pm/model'
import { EditorState, NodeSelection, TextSelection } from '@tiptap/pm/state'
import { act, createElement, StrictMode } from 'react'
import { afterEach, describe, expect, it } from 'vitest'

import { DocView } from '../components/DocView.js'
import type { DocViewLike } from '../ReactEditorView.js'
import { ReactEditorView } from '../ReactEditorView.js'
import type { ViewDesc } from '../viewdesc.js'
import { NodeViewDesc, TextViewDesc } from '../viewdesc.js'
import {
  br,
  doc,
  mountTrackedRoot,
  p,
  testSchema as schema,
  unmountTrackedRoots,
} from './helpers.js'

afterEach(unmountTrackedRoots)

const renderDoc = async (docNode: ProseMirrorNode, strict = false) => {
  const { root, container } = mountTrackedRoot()

  const render = async (node: ProseMirrorNode) => {
    const element = createElement(DocView, { node })

    await act(async () => {
      root.render(strict ? createElement(StrictMode, null, element) : element)
    })
  }

  await render(docNode)
  const dom = container.firstElementChild as HTMLDivElement

  return {
    container,
    dom,
    render,
    get docDesc() {
      return dom.pmViewDesc as NodeViewDesc
    },
  }
}

/** Constructs a ReactEditorView on the rendered element and wires its docView. */
const mountView = (dom: HTMLElement, docNode: ProseMirrorNode) => {
  const view = new ReactEditorView(dom, { state: EditorState.create({ doc: docNode }) })

  ;(view as unknown as { docView: DocViewLike }).docView = dom.pmViewDesc as unknown as DocViewLike
  return view
}

describe('static React document rendering', () => {
  it('renders paragraphs as exact markup with no wrapper DOM', async () => {
    const { dom } = await renderDoc(doc(p('foo'), p('bar')))

    expect(dom.innerHTML).toBe('<p>foo</p><p>bar</p>')
  })

  it('renders leaf nodes and attribute-bearing specs exactly', async () => {
    const { dom } = await renderDoc(
      doc(p('foo', br(), 'bar'), schema.node('blockquote', null, [p('quoted')])),
    )

    expect(dom.innerHTML).toBe(
      '<p>foo<br>bar</p><blockquote class="quote" data-kind="note"><p>quoted</p></blockquote>',
    )
  })

  it('builds a desc tree matching the rendered DOM', async () => {
    const docNode = doc(p('foo'), p('bar'))
    const { dom, docDesc } = await renderDoc(docNode)

    expect(docDesc).toBeInstanceOf(NodeViewDesc)
    expect(docDesc.node).toBe(docNode)
    expect(docDesc.size).toBe(docNode.nodeSize)
    expect(docDesc.children).toHaveLength(2)

    const [p1Desc, p2Desc] = docDesc.children as NodeViewDesc[]

    expect(p1Desc.dom).toBe(dom.children[0])
    expect(p2Desc.dom).toBe(dom.children[1])
    expect(p1Desc.parent).toBe(docDesc)

    const textDesc = p1Desc.children[0] as TextViewDesc

    expect(textDesc).toBeInstanceOf(TextViewDesc)
    expect(textDesc.nodeDOM).toBe(dom.children[0].firstChild)
    expect(textDesc.node.text).toBe('foo')
  })

  it('supports the mapping matrix against React-rendered DOM', async () => {
    const docNode = doc(p('foo'), p('bar'))
    const { dom, docDesc } = await renderDoc(docNode)
    const view = mountView(dom, docNode)

    const t1 = dom.children[0].firstChild as Text
    const t2 = dom.children[1].firstChild as Text

    const expectDOMPos = (actual: { node: Node; offset: number }, node: Node, offset: number) => {
      expect(actual.node).toBe(node)
      expect(actual.offset).toBe(offset)
    }

    // domAtPos / posAtDOM / nodeDOM at start, middle, and end boundaries
    expectDOMPos(view.domAtPos(0), dom, 0)
    expectDOMPos(view.domAtPos(2), t1, 1)
    expectDOMPos(view.domAtPos(6, 1), t2, 0)
    expect(view.posAtDOM(t1, 0)).toBe(1)
    expect(view.posAtDOM(t2, 3)).toBe(9)
    expect(view.posAtDOM(dom, 1, -1)).toBe(5)
    expect(view.nodeDOM(0)).toBe(dom.children[0])
    expect(view.nodeDOM(5)).toBe(dom.children[1])
    expect(view.nodeDOM(1)).toBe(t1)

    // Collapsed, range, and node selections round-trip
    for (const pos of [1, 3, 4, 6, 9]) {
      const selection = TextSelection.create(docNode, pos)
      const { node, offset } = view.domAtPos(selection.head)

      expect(TextSelection.create(docNode, view.posAtDOM(node, offset)).eq(selection)).toBe(true)
    }

    const range = TextSelection.create(docNode, 2, 8)
    const anchorDOM = view.domAtPos(range.anchor)
    const headDOM = view.domAtPos(range.head)

    expect(
      TextSelection.create(
        docNode,
        view.posAtDOM(anchorDOM.node, anchorDOM.offset),
        view.posAtDOM(headDOM.node, headDOM.offset),
      ).eq(range),
    ).toBe(true)

    const nodeSelection = NodeSelection.create(docNode, 5)
    const target = (docDesc as unknown as ViewDesc).domAfterPos(nodeSelection.from)

    expect(target).toBe(dom.children[1])
    expect(NodeSelection.create(docNode, target.pmViewDesc!.posBefore).eq(nodeSelection)).toBe(true)

    view.destroy()
  })

  it('maps hard breaks', async () => {
    const docNode = doc(p('foo', br(), 'bar'))
    const { dom } = await renderDoc(docNode)
    const view = mountView(dom, docNode)

    const brElement = dom.querySelector('br') as HTMLBRElement

    // "foo" spans 1-4, the break sits at 4, "bar" spans 5-8
    expect(view.nodeDOM(4)).toBe(brElement)
    expect(view.posAtDOM(brElement, 0, -1)).toBe(4)
    expect(view.posAtDOM(brElement, 0, 1)).toBe(5)

    view.destroy()
  })

  it('updates DOM and descs on re-render', async () => {
    const before = doc(p('foo'), p('bar'))
    const after = doc(p('fox'), p('bar'), p('baz'))
    const { dom, render, docDesc } = await renderDoc(before)

    await render(after)

    expect(dom.innerHTML).toBe('<p>fox</p><p>bar</p><p>baz</p>')
    expect(docDesc.node).toBe(after)
    expect(docDesc.children).toHaveLength(3)

    const textDesc = (docDesc.children[0] as NodeViewDesc).children[0] as TextViewDesc

    expect(textDesc.node.text).toBe('fox')
    expect(textDesc.nodeDOM).toBe(dom.children[0].firstChild)
  })

  it('renders empty paragraphs with the trailing-break hack', async () => {
    const docNode = doc(p())
    const { dom, docDesc } = await renderDoc(docNode)

    expect(dom.innerHTML).toBe('<p><br></p>')

    const paragraphDesc = docDesc.children[0] as NodeViewDesc
    const [hackDesc] = paragraphDesc.children

    // The hack desc represents no content: mapping skips over it
    expect(hackDesc?.isTrailingHack).toBe(true)
    expect(hackDesc?.size).toBe(0)
    expect(paragraphDesc.size).toBe(2)
  })

  it('stays correct under StrictMode double-invocation', async () => {
    const docNode = doc(p('foo'), p('bar'))
    const { dom, docDesc } = await renderDoc(docNode, true)

    expect(dom.innerHTML).toBe('<p>foo</p><p>bar</p>')
    expect(docDesc.node).toBe(docNode)
    expect(docDesc.children).toHaveLength(2)
    expect((docDesc.children[0] as NodeViewDesc).dom.pmViewDesc).toBe(docDesc.children[0])
  })
})
