import { NodeSelection } from '@tiptap/pm/state'
import { act, createElement } from 'react'
import { afterEach, describe, expect, it } from 'vitest'

import type { NodeViewComponentProps } from '../components/NodeViewComponentProps.js'
import { useMergedRefs } from '../refs.js'
import { Counter, CounterExtension, renderTiptapEditor, unmountTrackedRoots } from './helpers.js'

afterEach(unmountTrackedRoots)

/** Content node view whose root is also its content element. */
const Paragraph = ({ children, ref, contentDOMRef }: NodeViewComponentProps<HTMLElement>) =>
  createElement('p', { ref: useMergedRefs(ref, contentDOMRef), className: 'custom' }, children)

describe('React node views', () => {
  it('renders an atom node view without wrapper DOM and maps it', async () => {
    const { dom, view } = await renderTiptapEditor(
      '<p>before</p><test-counter count="3"></test-counter>',
      [CounterExtension],
      { counter: Counter },
    )

    expect(dom.innerHTML).toBe(
      '<p>before</p><div class="counter" contenteditable="false"><button>count-3</button></div>',
    )

    // Counter node sits at pos 8 (paragraph "before" spans 0-8)
    expect(view.nodeDOM(8)).toBe(dom.children[1])
    expect(view.posAtDOM(dom.children[1], 0, -1)).toBe(8)
  })

  it('updates attributes from the component without remounting', async () => {
    const { dom } = await renderTiptapEditor(
      '<test-counter count="0"></test-counter>',
      [CounterExtension],
      { counter: Counter },
    )
    const rootEl = dom.children[0]
    const button = dom.querySelector('button') as HTMLButtonElement

    await act(async () => {
      button.click()
    })

    expect(dom.querySelector('button')?.textContent).toBe('count-1')
    expect(dom.children[0]).toBe(rootEl)
  })

  it('reflects node selection through the selected prop', async () => {
    const { editor, dom, view } = await renderTiptapEditor(
      '<p>x</p><test-counter count="0"></test-counter>',
      [CounterExtension],
      { counter: Counter },
    )

    await act(async () => {
      view.dispatch(view.state.tr.setSelection(NodeSelection.create(view.state.doc, 3)))
    })

    expect(dom.children[1].className).toContain('selected')
    // The desc's selectNode marking is applied on commit too
    expect(dom.children[1].classList.contains('ProseMirror-selectednode')).toBe(true)

    await act(async () => {
      editor.commands.setTextSelection(1)
    })

    expect(dom.children[1].className).toBe('counter')
  })

  it('deletes the node through deleteNode', async () => {
    const DeletableCounter = (props: NodeViewComponentProps<HTMLDivElement>) =>
      createElement(
        'div',
        { ref: props.ref, contentEditable: false },
        createElement('button', { onClick: () => props.deleteNode() }, 'delete'),
      )

    const { editor, dom } = await renderTiptapEditor(
      '<p>keep</p><test-counter count="0"></test-counter>',
      [CounterExtension],
      { counter: DeletableCounter },
    )

    await act(async () => {
      ;(dom.querySelector('button') as HTMLButtonElement).click()
    })

    expect(editor.state.doc.childCount).toBe(1)
    expect(dom.innerHTML).toBe('<p>keep</p>')
  })

  it('renders a content node view through contentDOMRef with exact DOM', async () => {
    const { editor, dom, view } = await renderTiptapEditor('<p>foo</p><p>bar</p>', [], {
      paragraph: Paragraph,
    })

    expect(dom.innerHTML).toBe('<p class="custom">foo</p><p class="custom">bar</p>')

    // Mapping works through the custom component's DOM
    const text1 = dom.children[0].firstChild as Text

    expect(view.posAtDOM(text1, 2)).toBe(3)
    expect(view.domAtPos(3).node).toBe(text1)

    // Editing inside the node view updates in place
    const el1 = dom.children[0]

    await act(async () => {
      editor.commands.insertContentAt(2, 'x')
    })

    expect(dom.innerHTML).toBe('<p class="custom">fxoo</p><p class="custom">bar</p>')
    expect(dom.children[0]).toBe(el1)
  })

  it('reports the current position through getPos across edits', async () => {
    let observedGetPos: (() => number | undefined) | undefined

    const SpyCounter = (props: NodeViewComponentProps<HTMLDivElement>) => {
      observedGetPos = props.getPos
      return createElement('div', { ref: props.ref, contentEditable: false }, 'spy')
    }

    const { editor } = await renderTiptapEditor(
      '<p>ab</p><test-counter count="0"></test-counter>',
      [CounterExtension],
      { counter: SpyCounter },
    )

    expect(observedGetPos?.()).toBe(4)

    await act(async () => {
      editor.commands.insertContentAt(2, 'xyz')
    })

    expect(observedGetPos?.()).toBe(7)
  })
})
