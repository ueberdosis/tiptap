import { act, createElement, useImperativeHandle } from 'react'
import { afterEach, describe, expect, it } from 'vitest'

import { ReactRenderer } from '../ReactRenderer.js'
import { renderTiptapEditor, unmountTrackedRoots } from './helpers.js'

afterEach(unmountTrackedRoots)

const Label = ({ text }: { text: string }) => createElement('span', { className: 'label' }, text)

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

    // A mention-list-style component exposing an imperative handle via props.ref
    const WithHandle = (props: { ref?: React.Ref<{ ping: () => string }> }) => {
      useImperativeHandle(props.ref, () => ({ ping: () => 'pong' }))
      return null
    }

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
