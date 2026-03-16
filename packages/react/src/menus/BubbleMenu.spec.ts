import { render } from '@testing-library/react'
import React, { createRef } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { BubbleMenu } from './BubbleMenu.js'

const { bubbleMenuPluginMock } = vi.hoisted(() => ({
  bubbleMenuPluginMock: vi.fn(() => ({ key: 'bubble-menu-plugin' })),
}))

vi.mock('@tiptap/extension-bubble-menu', () => ({
  BubbleMenuPlugin: bubbleMenuPluginMock,
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

describe('BubbleMenu', () => {
  beforeEach(() => {
    bubbleMenuPluginMock.mockClear()
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('applies html props to the actual menu element', () => {
    const editor = createEditor()
    const ref = createRef<HTMLDivElement>()
    const handleClick = vi.fn()
    let lastEvent: any
    const handleClickCapture = vi.fn()
    const handleDoubleClick = vi.fn()
    const initialProps = {
      editor: editor as never,
      className: 'bubble-menu',
      'data-testid': 'menu-element',
      'aria-label': 'Bubble menu',
      style: { zIndex: 9999, marginTop: 8, position: 'relative' },
      onClick: (event: unknown) => {
        lastEvent = event
        handleClick()
      },
      onClickCapture: handleClickCapture,
      onDoubleClick: handleDoubleClick,
      dangerouslySetInnerHTML: { __html: 'ignored' },
      pluginKey: 'bubbleMenu',
      tabIndex: 3,
      ref,
      children: React.createElement('button', { type: 'button' }, 'Menu action'),
    } as any
    const updatedProps = {
      editor: editor as never,
      className: 'bubble-menu-updated',
      style: { zIndex: 1000, marginTop: 16, position: 'static' },
      onClick: undefined,
      onClickCapture: undefined,
      onDoubleClick: undefined,
      pluginKey: 'bubbleMenu',
      tabIndex: undefined,
      ref,
      children: React.createElement('button', { type: 'button' }, 'Updated action'),
    } as any

    const { rerender, unmount } = render(React.createElement(BubbleMenu, initialProps))

    expect(editor.registerPlugin).toHaveBeenCalledTimes(1)
    expect(bubbleMenuPluginMock).toHaveBeenCalledTimes(1)

    const [{ element }] = bubbleMenuPluginMock.mock.calls[0] as unknown as [{ element: HTMLDivElement }]

    expect(element).toBeInstanceOf(HTMLDivElement)
    expect(element).toBe(ref.current)
    expect(element.className).toBe('bubble-menu')
    expect(element.getAttribute('data-testid')).toBe('menu-element')
    expect(element.getAttribute('aria-label')).toBe('Bubble menu')
    expect(element.tabIndex).toBe(3)
    expect(element.style.zIndex).toBe('9999')
    expect(element.style.marginTop).toBe('8px')
    expect(element.style.position).toBe('absolute')
    expect(element.getAttribute('dangerouslySetInnerHTML')).toBeNull()

    element.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    element.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }))
    element.querySelector('button')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))

    expect(handleClick).toHaveBeenCalledTimes(2)
    expect(handleDoubleClick).toHaveBeenCalledTimes(1)
    expect(handleClickCapture).toHaveBeenCalledTimes(2)
    expect(lastEvent.nativeEvent).toBeInstanceOf(MouseEvent)
    expect(lastEvent.currentTarget).toBe(element)
    expect(lastEvent.target).toBeInstanceOf(Element)
    expect(typeof lastEvent.persist).toBe('function')
    expect(element.textContent).toContain('Menu action')

    rerender(React.createElement(BubbleMenu, updatedProps))

    expect(element.className).toBe('bubble-menu-updated')
    expect(element.getAttribute('data-testid')).toBeNull()
    expect(element.getAttribute('aria-label')).toBeNull()
    expect(element.tabIndex).toBe(-1)
    expect(element.style.zIndex).toBe('1000')
    expect(element.style.marginTop).toBe('16px')
    expect(element.style.position).toBe('absolute')

    element.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    element.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }))
    element.querySelector('button')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))

    expect(handleClick).toHaveBeenCalledTimes(2)
    expect(handleDoubleClick).toHaveBeenCalledTimes(1)
    expect(handleClickCapture).toHaveBeenCalledTimes(2)
    expect(element.textContent).toContain('Updated action')

    unmount()

    expect(editor.unregisterPlugin).toHaveBeenCalledWith('bubbleMenu')
  })

  it('creates unique plugin keys when none are provided', () => {
    const editor = createEditor()
    const shouldShowA = vi.fn(() => true)
    const shouldShowB = vi.fn(() => false)

    const { unmount } = render(
      React.createElement(
        React.Fragment,
        null,
        React.createElement(BubbleMenu, {
          editor: editor as never,
          shouldShow: shouldShowA,
          children: React.createElement('button', { type: 'button' }, 'First'),
        } as any),
        React.createElement(BubbleMenu, {
          editor: editor as never,
          shouldShow: shouldShowB,
          children: React.createElement('button', { type: 'button' }, 'Second'),
        } as any),
      ),
    )

    expect(bubbleMenuPluginMock).toHaveBeenCalledTimes(2)

    const pluginCalls = bubbleMenuPluginMock.mock.calls as unknown as Array<[{ pluginKey: unknown }]>
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
