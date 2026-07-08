import type { MarkViewProps } from '@tiptap/core'
import { act, createElement } from 'react'
import { afterEach, describe, expect, it } from 'vitest'

import type { MarkViewComponentProps } from '../components/MarkViewComponentProps.js'
import { MarkViewContent, ReactMarkViewRenderer } from '../ReactMarkViewRenderer.js'
import { useMergedRefs } from '../refs.js'
import { HighlightExtension, renderTiptapEditor, unmountTrackedRoots } from './helpers.js'

afterEach(unmountTrackedRoots)

/** A component written exactly as for `@tiptap/react`'s ReactMarkViewRenderer. */
const HighlightComponent = (props: MarkViewProps) =>
  createElement(
    'mark',
    {
      className: 'legacy-highlight',
      onClick: () =>
        props.updateAttributes({ 'data-count': (props.mark.attrs['data-count'] as number) + 1 }),
      'data-count': props.mark.attrs['data-count'],
    },
    createElement(MarkViewContent, { className: 'legacy-highlight-content' }),
  )

const markViewHighlight = (options?: Parameters<typeof ReactMarkViewRenderer>[1]) =>
  HighlightExtension.extend({
    addMarkView: () => ReactMarkViewRenderer(HighlightComponent, options),
  })

describe('ReactMarkViewRenderer', () => {
  it('renders a component registered through addMarkView with content wired', async () => {
    const { view, dom } = await renderTiptapEditor('<p>a<test-highlight>bc</test-highlight>d</p>', [
      markViewHighlight(),
    ])

    const host = dom.querySelector('.mark-highlight') as HTMLElement
    const content = dom.querySelector('.legacy-highlight-content') as HTMLElement

    // The host span (the mark's DOM) wraps the component markup; the
    // MarkViewContent element carries the inline content
    expect(host.tagName).toBe('SPAN')
    expect(host.querySelector('.legacy-highlight')).toBeTruthy()
    expect(content.getAttribute('data-mark-view-content')).toBe('')
    expect(content.textContent).toBe('bc')

    // Positions map through the content element: "a"=1, "b"=2, "c"=3
    expect(view.posAtDOM(content.firstChild as Text, 1)).toBe(3)
    expect(view.domAtPos(3).node).toBe(content.firstChild)
  })

  it('keeps typing inside the mark view content', async () => {
    const { editor, dom } = await renderTiptapEditor(
      '<p>a<test-highlight>bc</test-highlight>d</p>',
      [markViewHighlight()],
    )

    await act(async () => {
      editor.commands.insertContentAt(3, 'X')
    })

    expect(dom.querySelector('.legacy-highlight-content')?.textContent).toBe('bXc')
  })

  it('supports updateAttributes from the component', async () => {
    const { dom } = await renderTiptapEditor('<p><test-highlight>hi</test-highlight></p>', [
      markViewHighlight(),
    ])

    const mark = dom.querySelector('.legacy-highlight') as HTMLElement

    expect(mark.getAttribute('data-count')).toBe('0')

    await act(async () => {
      mark.click()
    })

    expect((dom.querySelector('.legacy-highlight') as HTMLElement).getAttribute('data-count')).toBe(
      '1',
    )
  })

  it('applies as, className, and attrs options to the host element', async () => {
    const { dom } = await renderTiptapEditor('<p><test-highlight>hi</test-highlight></p>', [
      markViewHighlight({ as: 'em', className: 'from-options', attrs: { 'data-kind': 'legacy' } }),
    ])

    const host = dom.querySelector('.mark-highlight') as HTMLElement

    expect(host.tagName).toBe('EM')
    expect(host.classList.contains('from-options')).toBe(true)
    expect(host.getAttribute('data-kind')).toBe('legacy')
  })

  it('lets the markViews prop override the extension registration', async () => {
    const NativeHighlight = ({ children, ref, contentDOMRef }: MarkViewComponentProps) =>
      createElement(
        'mark',
        { ref: useMergedRefs(ref, contentDOMRef), className: 'native' },
        children,
      )

    const { dom } = await renderTiptapEditor(
      '<p><test-highlight>hi</test-highlight></p>',
      [markViewHighlight()],
      undefined,
      { highlight: NativeHighlight },
    )

    expect(dom.querySelector('mark.native')?.textContent).toBe('hi')
    expect(dom.querySelector('.mark-highlight')).toBeNull()
  })
})
