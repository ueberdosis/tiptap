import { Extension, Mark as TiptapMark, mergeAttributes } from '@tiptap/core'
import { Plugin, PluginKey, TextSelection } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import type { EditorView } from '@tiptap/pm/view'
import { act, createElement } from 'react'
import { afterEach, describe, expect, it } from 'vitest'

import type { MarkViewComponentProps } from '../components/MarkViewComponentProps.js'
import { useMergedRefs } from '../refs.js'
import {
  doc,
  marked,
  p,
  renderStaticDoc as renderDoc,
  renderTiptapEditor,
  unmountTrackedRoots,
} from './helpers.js'

afterEach(unmountTrackedRoots)

/** pos -> DOM (biased into text) -> pos must be the identity. */
const expectRoundTrips = (view: EditorView, positions: number[]) => {
  positions.forEach(pos => {
    const before = view.domAtPos(pos, -1)
    const after = view.domAtPos(pos, 1)

    expect(view.posAtDOM(before.node, before.offset, -1), `pos ${pos} biased backward`).toBe(pos)
    expect(view.posAtDOM(after.node, after.offset, 1), `pos ${pos} biased forward`).toBe(pos)
  })
}

describe('mark boundary matrix (schema marks)', () => {
  it('maps every boundary across adjacent and overlapping marks', async () => {
    // a=1, b=2 [bold], c=3 [bold+italic], d=4 [italic], e=5
    const docNode = doc(
      p('a', marked('b', 'bold'), marked('c', 'bold', 'italic'), marked('d', 'italic'), 'e'),
    )
    const { dom, view } = await renderDoc(docNode)

    // Overlap renders as shared-prefix nesting; italic cannot span the
    // strong boundary, so "d" opens a fresh <em>
    expect(dom.innerHTML).toBe('<p>a<strong>b<em>c</em></strong><em>d</em>e</p>')

    expectRoundTrips(view, [1, 2, 3, 4, 5, 6])

    // Targeted lookups on the nested run
    const nestedText = dom.querySelector('strong em')?.firstChild as Text

    expect(view.posAtDOM(nestedText, 0)).toBe(3)
    expect(view.posAtDOM(nestedText, 1)).toBe(4)
    expect(view.domAtPos(4, -1).node).toBe(nestedText)

    // Selections spanning one, two, and three mark boundaries round-trip
    ;[
      [2, 4],
      [1, 5],
      [2, 6],
    ].forEach(([anchor, head]) => {
      const selection = TextSelection.create(docNode, anchor, head)
      const anchorDOM = view.domAtPos(selection.anchor, 1)
      const headDOM = view.domAtPos(selection.head, -1)

      expect(
        TextSelection.create(
          docNode,
          view.posAtDOM(anchorDOM.node, anchorDOM.offset, 1),
          view.posAtDOM(headDOM.node, headDOM.offset, -1),
        ).eq(selection),
      ).toBe(true)
    })

    view.destroy()
  })

  it('maps boundaries at textblock edges with fully marked content', async () => {
    // <p><strong>xy</strong></p>: x=1, y=2
    const docNode = doc(p(marked('xy', 'bold')))
    const { dom, view } = await renderDoc(docNode)

    expect(dom.innerHTML).toBe('<p><strong>xy</strong></p>')
    expectRoundTrips(view, [1, 2, 3])
    expect(view.domAtPos(1, 1).node).toBe(dom.querySelector('strong')?.firstChild)

    view.destroy()
  })

  it('keeps non-spanning marks in separate elements with correct mapping', async () => {
    // Adjacent same-marked *text* merges into one node at the model level;
    // spanning:false shows between distinct children: a=1, b=2 [code],
    // br=3 [code], c=4 [code], d=5
    const codeBreak = (() => {
      const plain = doc(p('x')).type.schema.nodes.hardBreak.create()

      return plain.mark([plain.type.schema.marks.code.create()])
    })()
    const docNode = doc(p('a', marked('b', 'code'), codeBreak, marked('c', 'code'), 'd'))
    const { dom, view } = await renderDoc(docNode)

    // Each child gets its own element — the mark never spans
    expect(dom.innerHTML).toBe('<p>a<code>b</code><code><br></code><code>c</code>d</p>')

    const codes = Array.from(dom.querySelectorAll('code'))

    expect(view.posAtDOM(codes[0].firstChild as Text, 1)).toBe(3)
    expect(view.posAtDOM(codes[2].firstChild as Text, 0)).toBe(4)
    expectRoundTrips(view, [1, 2, 3, 4, 5, 6])

    view.destroy()
  })
})

/* Tiptap-flavored custom mark views */

const HighlightExtension = TiptapMark.create({
  name: 'highlight',
  parseHTML: () => [{ tag: 'test-highlight' }],
  renderHTML: ({ HTMLAttributes }) => ['test-highlight', mergeAttributes(HTMLAttributes)],
})

const BoldExtension = TiptapMark.create({
  name: 'bold',
  parseHTML: () => [{ tag: 'strong' }],
  renderHTML: () => ['strong', 0],
})

/** Custom mark view whose element is also its content element. */
const Highlight = ({ children, ref, contentDOMRef }: MarkViewComponentProps) =>
  createElement('mark', { ref: useMergedRefs(ref, contentDOMRef) }, children)

/** Custom mark view with separate content element and non-editable chrome. */
const Framed = ({ children, ref, contentDOMRef }: MarkViewComponentProps) =>
  createElement(
    'span',
    { ref, className: 'framed' },
    createElement('span', { ref: contentDOMRef, className: 'framed-content' }, children),
    createElement('button', { contentEditable: false }, 'ui'),
  )

describe('mark boundary matrix (custom React mark views)', () => {
  it('maps boundaries when custom marks nest with schema marks', async () => {
    // a=1, b=2 [bold], c=3 [bold+highlight], d=4 [highlight], e=5
    const { dom, view } = await renderTiptapEditor(
      '<p>a<strong>b<test-highlight>c</test-highlight></strong><test-highlight>d</test-highlight>e</p>',
      [BoldExtension, HighlightExtension],
      undefined,
      { highlight: Highlight },
    )

    expect(dom.querySelector('p')?.innerHTML).toBe(
      'a<strong>b<mark>c</mark></strong><mark>d</mark>e',
    )
    expectRoundTrips(view, [1, 2, 3, 4, 5, 6])

    const nested = dom.querySelector('strong mark')?.firstChild as Text

    expect(view.posAtDOM(nested, 0)).toBe(3)
    expect(view.domAtPos(3, 1).node).toBe(nested)
  })

  it('maps through a mark view with separate content element and chrome', async () => {
    // a=1, bc=2-3 [highlight], d=4
    const { dom, view, editor } = await renderTiptapEditor(
      '<p>a<test-highlight>bc</test-highlight>d</p>',
      [HighlightExtension],
      undefined,
      { highlight: Framed },
    )

    const content = dom.querySelector('.framed-content')?.firstChild as Text

    expect(view.posAtDOM(content, 1)).toBe(3)
    expect(view.domAtPos(3, -1).node).toBe(content)
    expectRoundTrips(view, [1, 2, 3, 4, 5])

    // Non-content chrome resolves to a sensible position (after the content)
    const button = dom.querySelector('.framed button') as HTMLElement

    expect(view.posAtDOM(button, 0)).toBe(4)

    // Editing at the boundaries keeps the mark view intact
    await act(async () => {
      editor.commands.insertContentAt(3, 'X')
    })
    expect(dom.querySelector('.framed-content')?.textContent).toBe('bXc')
    expect(editor.state.doc.textContent).toBe('abXcd')
  })

  it('splits decorated text inside a custom mark view content', async () => {
    const key = new PluginKey('markDeco')
    let decorations = DecorationSet.empty
    const decoExtension = Extension.create({
      name: 'markDeco',
      addProseMirrorPlugins() {
        return [
          new Plugin({
            key,
            props: { decorations: state => decorations.map(state.tr.mapping, state.doc) },
          }),
        ]
      },
    })

    // a=1, bcd=2-4 [highlight], e=5
    const { dom, view, editor } = await renderTiptapEditor(
      '<p>a<test-highlight>bcd</test-highlight>e</p>',
      [HighlightExtension, decoExtension],
      undefined,
      { highlight: Highlight },
    )

    await act(async () => {
      decorations = DecorationSet.create(editor.state.doc, [
        Decoration.inline(3, 4, { class: 'hl' }),
      ])
      editor.view.dispatch(editor.state.tr)
    })

    // The run splits inside the custom mark element: b, decorated c, d —
    // adjacent DOM text nodes plus a wrapped slice, all inside <mark>
    expect(dom.querySelector('p')?.innerHTML).toBe('a<mark>b<span class="hl">c</span>d</mark>e')

    const markElement = dom.querySelector('mark') as HTMLElement
    const bText = markElement.childNodes[0] as Text
    const cText = dom.querySelector('mark .hl')?.firstChild as Text
    const dText = markElement.childNodes[2] as Text

    // Slice-aware binding: each DOM text node maps to its slice
    expect(view.posAtDOM(bText, 1)).toBe(3)
    expect(view.posAtDOM(cText, 0)).toBe(3)
    expect(view.posAtDOM(cText, 1)).toBe(4)
    expect(view.posAtDOM(dText, 0)).toBe(4)
    expectRoundTrips(view, [2, 3, 4, 5])
  })
})
