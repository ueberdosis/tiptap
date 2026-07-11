import { Extension } from '@tiptap/core'
import { Plugin } from '@tiptap/pm/state'
import { act, createElement, useImperativeHandle } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ReactRenderer } from '../ReactRenderer.js'
import { renderTiptapEditor, unmountTrackedRoots } from './helpers.js'

afterEach(unmountTrackedRoots)

const Label = ({ text }: { text: string }) => createElement('span', { className: 'label' }, text)

// A mention-list-style component exposing an imperative handle via props.ref
const WithHandle = (props: { ref?: React.Ref<{ ping: () => string }> }) => {
  useImperativeHandle(props.ref, () => ({ ping: () => 'pong' }))
  return createElement('span', { className: 'label' }, 'sync')
}

describe('ReactRenderer', () => {
  it('renders a component into its own detached element', async () => {
    const { editor } = await renderTiptapEditor('<p>hi</p>')

    let renderer!: ReactRenderer

    await act(async () => {
      renderer = new ReactRenderer(Label, { editor, props: { text: 'menu' } })
    })

    expect(renderer.element.classList.contains('react-renderer')).toBe(true)
    // Not attached until the caller places it
    expect(renderer.element.parentNode).toBeNull()
    expect(renderer.element.querySelector('.label')?.textContent).toBe('menu')
  })

  it('applies as and className options', async () => {
    const { editor } = await renderTiptapEditor('<p>hi</p>')

    let renderer!: ReactRenderer

    await act(async () => {
      renderer = new ReactRenderer(Label, {
        editor,
        props: { text: 'x' },
        as: 'span',
        className: 'foo bar',
      })
    })

    expect(renderer.element.tagName).toBe('SPAN')
    expect(renderer.element.classList.contains('foo')).toBe(true)
    expect(renderer.element.classList.contains('bar')).toBe(true)
  })

  it('re-renders on updateProps', async () => {
    const { editor } = await renderTiptapEditor('<p>hi</p>')

    let renderer!: ReactRenderer

    await act(async () => {
      renderer = new ReactRenderer(Label, { editor, props: { text: 'one' } })
    })

    await act(async () => {
      renderer.updateProps({ text: 'two' })
    })
    expect(renderer.element.querySelector('.label')?.textContent).toBe('two')
  })

  it('captures the component ref for imperative handles', async () => {
    const { editor } = await renderTiptapEditor('<p>hi</p>')

    let renderer!: ReactRenderer<{ ping: () => string }>

    await act(async () => {
      renderer = new ReactRenderer<{ ping: () => string }>(WithHandle, { editor })
    })

    expect(renderer.ref?.ping()).toBe('pong')
  })

  it('updateAttributes writes to the host element', async () => {
    const { editor } = await renderTiptapEditor('<p>hi</p>')

    let renderer!: ReactRenderer

    await act(async () => {
      renderer = new ReactRenderer(Label, { editor, props: { text: 'x' } })
    })

    renderer.updateAttributes({ 'data-placement': 'top' })
    expect(renderer.element.getAttribute('data-placement')).toBe('top')
  })

  it('commits content and ref asynchronously, by the next microtask', async () => {
    const { editor } = await renderTiptapEditor('<p>hi</p>')

    let renderer!: ReactRenderer<{ ping: () => string }>

    await act(async () => {
      renderer = new ReactRenderer<{ ping: () => string }>(WithHandle, { editor })

      // Intentional difference from @tiptap/react: rendering stays batched,
      // so nothing is mounted in the construction task itself
      expect(renderer.element.firstElementChild).toBeNull()
      expect(renderer.ref).toBeNull()
    })

    expect(renderer.element.querySelector('.label')?.textContent).toBe('sync')
    expect(renderer.ref?.ping()).toBe('pong')
  })

  it('does not warn when constructed from a plugin view during the editor commit', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})

    let renderer!: ReactRenderer
    const PopupExtension = Extension.create({
      name: 'popup',
      addProseMirrorPlugins() {
        return [
          new Plugin({
            view: view => {
              renderer = new ReactRenderer(Label, {
                editor: this.editor,
                props: { text: 'popup' },
              })
              void view
              return { destroy: () => renderer.destroy() }
            },
          }),
        ]
      },
    })

    await renderTiptapEditor('<p>hi</p>', [PopupExtension])
    await act(async () => {})

    expect(renderer.element.querySelector('.label')?.textContent).toBe('popup')
    const flushSyncWarning = error.mock.calls.some(call => String(call[0]).includes('flushSync'))

    expect(flushSyncWarning).toBe(false)
    error.mockRestore()
  })

  it('destroy detaches the element and tolerates a second call', async () => {
    const { editor } = await renderTiptapEditor('<p>hi</p>')

    let renderer!: ReactRenderer

    await act(async () => {
      renderer = new ReactRenderer(Label, { editor, props: { text: 'gone' } })
    })
    document.body.appendChild(renderer.element)

    await act(async () => {
      renderer.destroy()
      renderer.destroy()
    })

    expect(renderer.element.parentNode).toBeNull()
  })
})
