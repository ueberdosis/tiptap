import { TextSelection } from '@tiptap/pm/state'
import { afterEach, describe, expect, it } from 'vitest'

import { MarkViewDesc, NodeViewDesc, TextViewDesc } from '../viewdesc.js'
import { br, doc, marked, p, renderStaticDoc as renderDoc, unmountTrackedRoots } from './helpers.js'

afterEach(unmountTrackedRoots)

describe('mark rendering', () => {
  it('renders marks from their toDOM specs with exact markup', async () => {
    const { dom } = await renderDoc(doc(p('a', marked('b', 'bold'), 'c')))

    expect(dom.innerHTML).toBe('<p>a<strong>b</strong>c</p>')
  })

  it('nests multiple marks and merges shared runs', async () => {
    const { dom } = await renderDoc(doc(p(marked('one', 'bold'), marked('two', 'bold', 'italic'))))

    expect(dom.innerHTML).toBe('<p><strong>one<em>two</em></strong></p>')
  })

  it('builds mark descs between the node and its text', async () => {
    const { docDesc } = await renderDoc(doc(p('a', marked('b', 'bold'))))
    const paragraphDesc = docDesc.children[0] as NodeViewDesc

    expect(paragraphDesc.children).toHaveLength(2)
    expect(paragraphDesc.children[0]).toBeInstanceOf(TextViewDesc)

    const markDesc = paragraphDesc.children[1] as MarkViewDesc

    expect(markDesc).toBeInstanceOf(MarkViewDesc)
    expect(markDesc.size).toBe(1)
    expect(markDesc.children[0]).toBeInstanceOf(TextViewDesc)
  })

  it('maps positions through marked text', async () => {
    // Positions: <p> at 0, "a" 1-2, "bb" (bold) 2-4, "c" 4-5
    const docNode = doc(p('a', marked('bb', 'bold'), 'c'))
    const { dom, view } = await renderDoc(docNode)
    const boldText = dom.querySelector('strong')?.firstChild as Text

    expect(view.posAtDOM(boldText, 1)).toBe(3)

    const { node, offset } = view.domAtPos(3)

    expect(node).toBe(boldText)
    expect(offset).toBe(1)

    // Selection round-trip across the mark boundary
    const selection = TextSelection.create(docNode, 1, 4)
    const anchorDOM = view.domAtPos(selection.anchor)
    const headDOM = view.domAtPos(selection.head)

    expect(
      TextSelection.create(
        docNode,
        view.posAtDOM(anchorDOM.node, anchorDOM.offset),
        view.posAtDOM(headDOM.node, headDOM.offset),
      ).eq(selection),
    ).toBe(true)

    view.destroy()
  })

  it('keeps inline leaf nodes inside shared mark runs', async () => {
    const boldBreak = testMarkedBreak()
    const { dom } = await renderDoc(doc(p(marked('x', 'bold'), boldBreak, marked('y', 'bold'))))

    expect(dom.innerHTML).toBe('<p><strong>x<br>y</strong></p>')
  })
})

const testMarkedBreak = () => {
  const plain = br()

  return plain.mark([plain.type.schema.marks.bold.create()])
}
