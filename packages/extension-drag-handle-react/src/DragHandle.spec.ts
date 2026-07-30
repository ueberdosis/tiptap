import { render } from '@testing-library/react'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { DragHandle } from './DragHandle.js'

const { dragHandlePluginMock, unbindMock } = vi.hoisted(() => ({
  dragHandlePluginMock: vi.fn(() => ({
    plugin: { spec: { key: 'dragHandle' } },
    unbind: unbindMock,
  })),
  unbindMock: vi.fn(),
}))

vi.mock('@tiptap/extension-drag-handle', () => ({
  DragHandlePlugin: dragHandlePluginMock,
  dragHandlePluginDefaultKey: 'dragHandle',
  defaultComputePositionConfig: {},
  normalizeNestedOptions: (value: unknown) => value,
}))

function createEditor() {
  return {
    isDestroyed: false,
    registerPlugin: vi.fn(),
    unregisterPlugin: vi.fn(),
  }
}

describe('DragHandle', () => {
  beforeEach(() => {
    dragHandlePluginMock.mockClear()
    unbindMock.mockClear()
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('survives the React 19 strict-mode double mount with a stable portal element', () => {
    const editor = createEditor()

    let result: ReturnType<typeof render> | undefined
    const renderInStrictMode = () => {
      result = render(
        React.createElement(
          React.StrictMode,
          null,
          React.createElement(DragHandle, {
            editor: editor as never,
            children: React.createElement('button', { type: 'button' }, 'Drag'),
          } as never),
        ),
      )
    }

    expect(renderInStrictMode).not.toThrow()

    // StrictMode mounts, tears down, then remounts the effect in development.
    // Every setup pass must reuse the same element instance created via useRef.
    expect(dragHandlePluginMock.mock.calls.length).toBeGreaterThan(1)
    const elements = dragHandlePluginMock.mock.calls.map(([options]) => options.element)
    const [firstElement] = elements

    expect(firstElement).toBeInstanceOf(HTMLDivElement)
    expect(elements.every(element => element === firstElement)).toBe(true)
    expect(unbindMock).toHaveBeenCalled()
    expect(firstElement.textContent).toContain('Drag')

    result?.unmount()

    expect(editor.unregisterPlugin).toHaveBeenCalledWith('dragHandle')
    expect(unbindMock).toHaveBeenCalled()
  })

  it('updates className without re-registering the plugin', () => {
    const editor = createEditor()

    const { rerender } = render(
      React.createElement(DragHandle, {
        editor: editor as never,
        className: 'drag-handle',
        children: React.createElement('span', null, 'Handle'),
      } as never),
    )

    const registerCount = editor.registerPlugin.mock.calls.length
    const unregisterCount = editor.unregisterPlugin.mock.calls.length
    const element = dragHandlePluginMock.mock.calls[0][0].element

    expect(element.className).toBe('drag-handle')

    rerender(
      React.createElement(DragHandle, {
        editor: editor as never,
        className: 'drag-handle-updated',
        children: React.createElement('span', null, 'Handle'),
      } as never),
    )

    expect(element.className).toBe('drag-handle-updated')
    expect(editor.registerPlugin.mock.calls.length).toBe(registerCount)
    expect(editor.unregisterPlugin.mock.calls.length).toBe(unregisterCount)
  })
})
