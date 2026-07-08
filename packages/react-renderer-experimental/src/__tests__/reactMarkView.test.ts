import { Mark as TiptapMark, mergeAttributes } from '@tiptap/core'
import { TextSelection } from '@tiptap/pm/state'
import { act, createElement } from 'react'
import { afterEach, describe, expect, it } from 'vitest'

import type { MarkViewComponentProps } from '../components/MarkViewComponentProps.js'
import { useMergedRefs } from '../refs.js'
import { renderTiptapEditor, unmountTrackedRoots } from './helpers.js'

afterEach(unmountTrackedRoots)

const HighlightExtension = TiptapMark.create({
  name: 'highlight',
  addAttributes: () => ({ 'data-count': { default: 0 } }),
  parseHTML: () => [{ tag: 'test-highlight' }],
  renderHTML: ({ HTMLAttributes }) => ['test-highlight', mergeAttributes(HTMLAttributes)],
})

/** Mark view whose top-level element is also its content element. */
const Highlight = ({ children, ref, contentDOMRef, HTMLAttributes }: MarkViewComponentProps) =>
  createElement(
    'mark',
    { ref: useMergedRefs(ref, contentDOMRef), 'data-count': HTMLAttributes['data-count'] },
    children,
  )

/** Mark view with a separate content element and non-editable chrome. */
const Framed = ({ children, ref, contentDOMRef, mark, updateAttributes }: MarkViewComponentProps) =>
  createElement(
    'span',
    { ref, className: 'framed' },
    createElement('span', { ref: contentDOMRef, className: 'framed-content' }, children),
    createElement(
      'button',
      {
        contentEditable: false,
        onClick: () => updateAttributes({ 'data-count': (mark.attrs['data-count'] as number) + 1 }),
      },
      'bump',
    ),
  )

describe('React mark views', () => {
  it('renders a mark view component without wrapper DOM', async () => {
    const { dom } = await renderTiptapEditor(
      '<p>a<test-highlight>bc</test-highlight>d</p>',
      [HighlightExtension],
      undefined,
      { highlight: Highlight },
    )

    expect(dom.innerHTML).toBe('<p>a<mark data-count="0">bc</mark>d</p>')
  })

  it('maps positions through the mark view content', async () => {
    const { dom, view } = await renderTiptapEditor(
      '<p>a<test-highlight>bc</test-highlight>d</p>',
      [HighlightExtension],
      undefined,
      { highlight: Highlight },
    )

    const markedText = dom.querySelector('mark')?.firstChild as Text

    // "a"=1, "b"=2, "c"=3, "d"=4
    expect(view.posAtDOM(markedText, 1)).toBe(3)
    expect(view.domAtPos(3).node).toBe(markedText)

    // A selection spanning the mark boundary round-trips
    const selection = TextSelection.create(view.state.doc, 2, 5)
    const anchor = view.domAtPos(selection.anchor)
    const head = view.domAtPos(selection.head)

    expect(
      TextSelection.create(
        view.state.doc,
        view.posAtDOM(anchor.node, anchor.offset),
        view.posAtDOM(head.node, head.offset),
      ).eq(selection),
    ).toBe(true)
  })

  it('supports separate content elements and updateAttributes', async () => {
    const { editor, dom } = await renderTiptapEditor(
      '<p><test-highlight>hi</test-highlight></p>',
      [HighlightExtension],
      undefined,
      { highlight: Framed },
    )

    expect(dom.querySelector('p')?.innerHTML).toBe(
      '<span class="framed"><span class="framed-content">hi</span><button contenteditable="false">bump</button></span>',
    )

    await act(async () => {
      dom.querySelector('button')?.click()
    })

    const mark = editor.state.doc.nodeAt(1)?.marks[0]

    expect(mark?.attrs['data-count']).toBe(1)
    // Content survives the attribute update in place
    expect(dom.querySelector('.framed-content')?.textContent).toBe('hi')
  })

  it('keeps typing inside a mark view working', async () => {
    const { editor, dom } = await renderTiptapEditor(
      '<p>a<test-highlight>bc</test-highlight>d</p>',
      [HighlightExtension],
      undefined,
      { highlight: Highlight },
    )

    await act(async () => {
      editor.commands.insertContentAt(3, 'X')
    })

    expect(dom.querySelector('mark')?.textContent).toBe('bXc')
    expect(editor.state.doc.textContent).toBe('abXcd')
  })
})
