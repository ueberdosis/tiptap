import { render } from '@testing-library/react'
import React, { createRef } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { FloatingMenu } from './FloatingMenu.js'

const { floatingMenuPluginMock } = vi.hoisted(() => ({
  floatingMenuPluginMock: vi.fn(() => ({ key: 'floating-menu-plugin' })),
}))

vi.mock('@tiptap/extension-floating-menu', () => ({
  FloatingMenuPlugin: floatingMenuPluginMock,
}))

function createEditor() {
  const tr = {
    setMeta: vi.fn(() => tr),
  }

  return {
    isDestroyed: false,
    registerPlugin: vi.fn(),
    unregisterPlugin: vi.fn(),
    view: {
      dispatch: vi.fn(),
    },
    state: {
      tr,
    },
  }
}

describe('FloatingMenu', () => {
  beforeEach(() => {
    floatingMenuPluginMock.mockClear()
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('applies html props to the actual menu element', () => {
    const editor = createEditor()
    const ref = createRef<HTMLDivElement>()
    const handleClick = vi.fn()
    const handleClickCapture = vi.fn()
    const handleDoubleClick = vi.fn()
    const initialProps = {
      editor: editor as never,
      className: 'floating-menu',
      'data-testid': 'floating-element',
      'aria-label': 'Floating menu',
      style: { zIndex: 8888, marginTop: 12, position: 'relative' },
      onClick: handleClick,
      onClickCapture: handleClickCapture,
      onDoubleClick: handleDoubleClick,
      pluginKey: 'floatingMenu',
      tabIndex: 5,
      ref,
      children: React.createElement('button', { type: 'button' }, 'Floating action'),
    } as any
    const updatedProps = {
      editor: editor as never,
      className: 'floating-menu-updated',
      style: { zIndex: 7777, marginTop: 20, position: 'static' },
      onClick: undefined,
      onClickCapture: undefined,
      onDoubleClick: undefined,
      pluginKey: 'floatingMenu',
      tabIndex: undefined,
      ref,
      children: React.createElement('button', { type: 'button' }, 'Updated floating action'),
    } as any

    const { rerender, unmount } = render(React.createElement(FloatingMenu, initialProps))

    expect(editor.registerPlugin).toHaveBeenCalledTimes(1)
    expect(floatingMenuPluginMock).toHaveBeenCalledTimes(1)

    const [{ element }] = floatingMenuPluginMock.mock.calls[0] as unknown as [{ element: HTMLDivElement }]

    expect(element).toBeInstanceOf(HTMLDivElement)
    expect(element).toBe(ref.current)
    expect(element.className).toBe('floating-menu')
    expect(element.getAttribute('data-testid')).toBe('floating-element')
    expect(element.getAttribute('aria-label')).toBe('Floating menu')
    expect(element.tabIndex).toBe(5)
    expect(element.style.zIndex).toBe('8888')
    expect(element.style.marginTop).toBe('12px')
    expect(element.style.position).toBe('absolute')

    element.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    element.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }))
    element.querySelector('button')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))

    expect(handleClick).toHaveBeenCalledTimes(2)
    expect(handleDoubleClick).toHaveBeenCalledTimes(1)
    expect(handleClickCapture).toHaveBeenCalledTimes(2)
    expect(element.textContent).toContain('Floating action')

    rerender(React.createElement(FloatingMenu, updatedProps))

    expect(element.className).toBe('floating-menu-updated')
    expect(element.getAttribute('data-testid')).toBeNull()
    expect(element.getAttribute('aria-label')).toBeNull()
    expect(element.tabIndex).toBe(-1)
    expect(element.style.zIndex).toBe('7777')
    expect(element.style.marginTop).toBe('20px')
    expect(element.style.position).toBe('absolute')

    element.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    element.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }))
    element.querySelector('button')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))

    expect(handleClick).toHaveBeenCalledTimes(2)
    expect(handleDoubleClick).toHaveBeenCalledTimes(1)
    expect(handleClickCapture).toHaveBeenCalledTimes(2)
    expect(element.textContent).toContain('Updated floating action')

    unmount()

    expect(editor.unregisterPlugin).toHaveBeenCalledWith('floatingMenu')
  })

  it('creates unique plugin keys when none are provided', () => {
    const editor = createEditor()
    const shouldShowA = vi.fn(() => true)
    const shouldShowB = vi.fn(() => false)

    const { unmount } = render(
      React.createElement(
        React.Fragment,
        null,
        React.createElement(FloatingMenu, {
          editor: editor as never,
          shouldShow: shouldShowA,
          children: React.createElement('button', { type: 'button' }, 'First'),
        } as any),
        React.createElement(FloatingMenu, {
          editor: editor as never,
          shouldShow: shouldShowB,
          children: React.createElement('button', { type: 'button' }, 'Second'),
        } as any),
      ),
    )

    expect(floatingMenuPluginMock).toHaveBeenCalledTimes(2)

    const pluginCalls = floatingMenuPluginMock.mock.calls as unknown as Array<[{ pluginKey: unknown }]>
    const firstPluginKey = pluginCalls[0][0].pluginKey
    const secondPluginKey = pluginCalls[1][0].pluginKey

    expect(firstPluginKey).toBeDefined()
    expect(secondPluginKey).toBeDefined()
    expect(firstPluginKey).not.toBe(secondPluginKey)

    unmount()

    const unregisterCalls = editor.unregisterPlugin.mock.calls as unknown as Array<[unknown]>

    expect(unregisterCalls.some(([key]) => key === firstPluginKey)).toBe(true)
    expect(unregisterCalls.some(([key]) => key === secondPluginKey)).toBe(true)
  })
})
