import { Extension, Mark as TiptapMark } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import { act, createElement, forwardRef } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { WidgetComponentProps } from '../decorations/widget.js'
import { widget } from '../decorations/widget.js'
import { renderTiptapEditor, unmountTrackedRoots } from './helpers.js'

afterEach(unmountTrackedRoots)

/**
 * An extension whose plugin serves decorations from editor storage;
 * `setDecorations` swaps them and triggers a decoration-only transaction.
 */
const decorationExtension = () => {
  const key = new PluginKey('testDecorations')
  let current = DecorationSet.empty
  const extension = Extension.create({
    name: 'testDecorations',
    addProseMirrorPlugins() {
      return [
        new Plugin({
          key,
          props: {
            decorations: state => current.map(state.tr.mapping, state.doc),
          },
        }),
      ]
    },
  })

  return {
    extension,
    setDecorations: (
      editor: { state: { doc: unknown; tr: unknown }; view: { dispatch: (tr: never) => void } },
      decorations: Decoration[],
    ) => {
      const state = editor.state as unknown as {
        doc: Parameters<typeof DecorationSet.create>[0]
        tr: never
      }

      current = DecorationSet.create(state.doc, decorations)
      // A metadata-only transaction: no doc change, decorations re-read
      editor.view.dispatch(state.tr)
    },
  }
}

describe('decorations', () => {
  it('renders inline decorations as spans over the exact range', async () => {
    const { extension, setDecorations } = decorationExtension()
    const { editor, dom, view } = await renderTiptapEditor('<p>hello world</p>', [extension])

    await act(async () => {
      setDecorations(editor, [Decoration.inline(1, 6, { class: 'highlight' })])
    })

    // "hello" wrapped, " world" untouched, offsets preserved
    expect(dom.querySelector('p')?.innerHTML).toBe('<span class="highlight">hello</span> world')

    // Mapping still holds through the wrapper: positions inside and after
    const span = dom.querySelector('span.highlight') as HTMLElement
    const decoratedText = span.firstChild as Text
    const plainText = span.nextSibling as Text

    expect(view.posAtDOM(decoratedText, 2)).toBe(3)
    expect(view.posAtDOM(plainText, 3)).toBe(9)
    expect(view.domAtPos(3).node).toBe(decoratedText)
    expect(view.domAtPos(9).node).toBe(plainText)

    // Removing the decoration unwraps without leftovers
    await act(async () => {
      setDecorations(editor, [])
    })
    expect(dom.querySelector('p')?.innerHTML).toBe('hello world')

    editor.destroy()
  })

  it('applies node decorations as attributes and removes them again', async () => {
    const { extension, setDecorations } = decorationExtension()
    const { editor, dom } = await renderTiptapEditor('<p>one</p><p>two</p>', [extension])

    await act(async () => {
      setDecorations(editor, [Decoration.node(0, 5, { class: 'selected', 'data-x': 'y' })])
    })

    const [first, second] = Array.from(dom.querySelectorAll('p'))

    expect(first.className).toBe('selected')
    expect(first.getAttribute('data-x')).toBe('y')
    expect(second.hasAttribute('class')).toBe(false)

    await act(async () => {
      setDecorations(editor, [])
    })
    expect(first.hasAttribute('class')).toBe(false)
    expect(first.hasAttribute('data-x')).toBe(false)

    editor.destroy()
  })

  it('mounts, positions, and unmounts React widget decorations', async () => {
    const mounted = vi.fn()
    const destroyed = vi.fn()
    const Badge = forwardRef<HTMLSpanElement, WidgetComponentProps>(function Badge(props, ref) {
      mounted()
      return createElement('span', { ref, className: 'badge' }, '!')
    })

    const { extension, setDecorations } = decorationExtension()
    const { editor, dom, view } = await renderTiptapEditor('<p>hello</p>', [extension])

    await act(async () => {
      setDecorations(editor, [widget(3, Badge, { key: 'badge', destroy: destroyed })])
    })

    const badge = dom.querySelector('span.badge') as HTMLElement

    expect(badge).toBeTruthy()
    expect(badge.textContent).toBe('!')
    // Injected between "he" and "llo", with the non-raw widget treatment
    expect(badge.previousSibling?.nodeValue).toBe('he')
    expect(badge.nextSibling?.nodeValue).toBe('llo')
    expect(badge.contentEditable).toBe('false')
    expect(badge.classList.contains('ProseMirror-widget')).toBe(true)

    // The widget occupies no document positions
    expect(view.posAtDOM(badge.nextSibling as Node, 1)).toBe(4)
    expect(view.state.doc.textContent).toBe('hello')

    await act(async () => {
      setDecorations(editor, [])
    })
    expect(dom.querySelector('span.badge')).toBeNull()
    expect(destroyed).toHaveBeenCalledTimes(1)

    editor.destroy()
  })

  it('hosts native toDOM widgets and orders widgets by side', async () => {
    const { extension, setDecorations } = decorationExtension()
    const { editor, dom } = await renderTiptapEditor('<p>ab</p>', [extension])

    const makeNative = (label: string) => () => {
      const el = document.createElement('b')

      el.textContent = label
      return el
    }

    await act(async () => {
      setDecorations(editor, [
        Decoration.widget(2, makeNative('right'), { side: 1, key: 'right' }),
        Decoration.widget(2, makeNative('left'), { side: -1, key: 'left' }),
      ])
    })

    const labels = Array.from(dom.querySelectorAll('b')).map(el => el.textContent)

    expect(labels).toEqual(['left', 'right'])

    // Both sit between "a" and "b"; side only orders widgets at the same
    // position (prosemirror-view semantics)
    const paragraph = dom.querySelector('p') as HTMLElement
    const sequence = Array.from(paragraph.childNodes).map(child =>
      child.nodeType === Node.TEXT_NODE ? child.nodeValue : (child as HTMLElement).textContent,
    )

    expect(sequence).toEqual(['a', 'left', 'right', 'b'])

    editor.destroy()
  })

  it('keeps sibling identity on decoration-only transactions', async () => {
    const { extension, setDecorations } = decorationExtension()
    const { editor, dom } = await renderTiptapEditor('<p>one</p><p>two</p>', [extension])

    const [firstBefore, secondBefore] = Array.from(dom.querySelectorAll('p'))

    await act(async () => {
      setDecorations(editor, [Decoration.inline(1, 4, { class: 'hl' })])
    })

    const [firstAfter, secondAfter] = Array.from(dom.querySelectorAll('p'))

    // Same host elements: no remount, only the decorated paragraph's content changed
    expect(firstAfter).toBe(firstBefore)
    expect(secondAfter).toBe(secondBefore)
    expect(secondAfter.innerHTML).toBe('two')

    editor.destroy()
  })

  it('renders inline decorations across mark boundaries', async () => {
    const Bold = TiptapMark.create({
      name: 'bold',
      parseHTML: () => [{ tag: 'strong' }],
      renderHTML: () => ['strong', 0],
    })
    const { extension, setDecorations } = decorationExtension()
    const { editor, dom, view } = await renderTiptapEditor('<p>ab<strong>cd</strong>ef</p>', [
      extension,
      Bold,
    ])

    await act(async () => {
      // Covers "b" (2-3), the bold "cd" (3-5), and "e" (5-6): splits both
      // plain runs
      setDecorations(editor, [Decoration.inline(2, 6, { class: 'hl' })])
    })

    expect(dom.querySelector('p')?.innerHTML).toBe(
      'a<span class="hl">b</span><strong><span class="hl">cd</span></strong><span class="hl">e</span>f',
    )

    // Offsets survive the splits
    expect(view.domAtPos(2, 1).node.nodeValue).toBe('b')
    expect(view.posAtDOM(dom.querySelector('strong span.hl')?.firstChild as Node, 1)).toBe(4)
    expect(view.domAtPos(6, 1).node.nodeValue).toBe('f')

    editor.destroy()
  })
})
