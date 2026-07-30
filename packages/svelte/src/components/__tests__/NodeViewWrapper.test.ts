// Registers the DOM cleanup hooks for this file, so the rest of the suite does
// not need the Svelte testing setup.
import '@testing-library/svelte/vitest'

import { render } from '@testing-library/svelte'
import { describe, expect, it } from 'vitest'

import NodeViewWrapper from '../NodeViewWrapper.svelte'

const getWrapper = (container: HTMLElement) =>
  container.querySelector('[data-node-view-wrapper]') as HTMLElement

describe('NodeViewWrapper', () => {
  it('passes unknown attributes through to the element', () => {
    const { container } = render(NodeViewWrapper, {
      'data-testid': 'wrapper',
      'aria-label': 'Counter',
      id: 'my-node',
    })

    const wrapper = getWrapper(container)

    expect(wrapper.getAttribute('data-testid')).toBe('wrapper')
    expect(wrapper.getAttribute('aria-label')).toBe('Counter')
    expect(wrapper.id).toBe('my-node')
  })

  it('keeps normal white-space when no style is passed', () => {
    const { container } = render(NodeViewWrapper, {})

    expect(getWrapper(container).style.whiteSpace).toBe('normal')
  })

  it('merges a custom style with the required white-space rule', () => {
    const { container } = render(NodeViewWrapper, {
      style: 'color: red; margin: 1rem',
    })

    const wrapper = getWrapper(container)

    expect(wrapper.style.whiteSpace).toBe('normal')
    expect(wrapper.style.color).toBe('red')
    expect(wrapper.style.margin).toBe('1rem')
  })

  it('lets a custom style override white-space', () => {
    const { container } = render(NodeViewWrapper, {
      style: 'white-space: pre',
    })

    expect(getWrapper(container).style.whiteSpace).toBe('pre')
  })

  it('renders the tag from the as prop and keeps the class prop', () => {
    const { container } = render(NodeViewWrapper, {
      as: 'span',
      class: 'my-node-view',
    })

    const wrapper = getWrapper(container)

    expect(wrapper.tagName).toBe('SPAN')
    expect(wrapper.className).toBe('my-node-view')
  })
})
