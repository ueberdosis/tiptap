import { act, createElement } from 'react'
import { afterEach, describe, expect, it } from 'vitest'

import { bridgeReactNodeView } from '../bridge/bridgeReactNodeView.js'
import { NodeViewContent } from '../NodeViewContent.js'
import { NodeViewWrapper } from '../NodeViewWrapper.js'
import type { ReactNodeViewProps } from '../types.js'
import { Counter } from './helpers.js'
import { CounterExtension, renderTiptapEditor, unmountTrackedRoots } from './helpers.js'

afterEach(unmountTrackedRoots)

/**
 * Legacy-style components, written exactly as for `ReactNodeViewRenderer`:
 * real `NodeViewWrapper` / `NodeViewContent` from `@tiptap/react`.
 */
const LegacyParagraph = (props: ReactNodeViewProps) =>
  createElement(
    NodeViewWrapper,
    { className: 'legacy-wrapper', 'data-name': props.node.type.name },
    createElement('label', { contentEditable: false }, 'legacy'),
    createElement(NodeViewContent, { className: 'legacy-content' }),
  )

const LegacyCounter = (props: ReactNodeViewProps) =>
  createElement(
    NodeViewWrapper,
    { className: 'legacy-counter' },
    createElement(
      'button',
      {
        contentEditable: false,
        onClick: () => props.updateAttributes({ count: (props.node.attrs.count as number) + 1 }),
      },
      `legacy-count-${props.node.attrs.count}`,
    ),
  )

describe('legacy node view bridge', () => {
  it('renders a legacy content component with wrapper and content wired', async () => {
    const { editor, view, dom } = await renderTiptapEditor('<p>hello</p>', [], {
      paragraph: bridgeReactNodeView(LegacyParagraph),
    })

    const wrapper = dom.querySelector('.legacy-wrapper') as HTMLElement
    const content = dom.querySelector('.legacy-content') as HTMLElement

    // The legacy markup renders as written, wrapper attributes included
    expect(wrapper).toBeTruthy()
    expect(wrapper.getAttribute('data-node-view-wrapper')).toBe('')
    expect(wrapper.getAttribute('data-name')).toBe('paragraph')
    expect(content.getAttribute('data-node-view-content')).toBe('')

    // NodeViewContent's ref became contentDOMRef: document content renders
    // inside it and the desc tree maps through the wrapper
    expect(content.textContent).toBe('hello')
    expect(view.nodeDOM(0)).toBe(wrapper)
    expect(view.posAtDOM(content.firstChild as Text, 2)).toBe(3)

    // Editing lands inside the legacy content element
    await act(async () => {
      editor.commands.insertContentAt(6, '!')
    })
    expect(content.textContent).toBe('hello!')

    editor.destroy()
  })

  it('supports legacy atom components with updateAttributes', async () => {
    const { dom, view } = await renderTiptapEditor(
      '<test-counter count="4"></test-counter>',
      [CounterExtension],
      { counter: bridgeReactNodeView(LegacyCounter) },
    )

    const button = dom.querySelector('.legacy-counter button') as HTMLButtonElement

    expect(button.textContent).toBe('legacy-count-4')

    await act(async () => {
      button.click()
    })
    expect(button.textContent).toBe('legacy-count-5')

    // Mapping: the wrapper is the node's DOM
    expect(view.nodeDOM(0)).toBe(dom.querySelector('.legacy-counter'))
  })

  it('does not remount bridged views on unrelated edits', async () => {
    const { editor, dom } = await renderTiptapEditor(
      '<p>first</p><test-counter count="0"></test-counter>',
      [CounterExtension],
      { counter: bridgeReactNodeView(LegacyCounter) },
    )

    const host = dom.querySelector('.legacy-counter') as HTMLElement

    await act(async () => {
      editor.commands.insertContentAt(1, 'X')
    })

    expect(dom.querySelector('.legacy-counter')).toBe(host)
    expect(editor.state.doc.textContent).toBe('Xfirst')
  })

  it('coexists with native experimental node views', async () => {
    const { dom } = await renderTiptapEditor(
      '<p>text</p><test-counter count="1"></test-counter>',
      [CounterExtension],
      {
        paragraph: bridgeReactNodeView(LegacyParagraph),
        counter: Counter,
      },
    )

    expect(dom.querySelector('.legacy-wrapper .legacy-content')?.textContent).toBe('text')
    expect(dom.querySelector('.counter button')?.textContent).toBe('count-1')
  })
})
