import { act, render } from '@testing-library/react'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useEditor } from './useEditor.js'

function TestEditor({ onCreate }: { onCreate: () => void }) {
  useEditor({
    extensions: [Document, Paragraph, Text],
    element: document.createElement('div'),
    immediatelyRender: true,
    onCreate,
  })
  return null
}

describe('useEditor', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    vi.useRealTimers()
  })

  it('calls onCreate exactly once when mounted under React.StrictMode', () => {
    vi.useFakeTimers()
    const onCreate = vi.fn()

    act(() => {
      render(
        React.createElement(React.StrictMode, null, React.createElement(TestEditor, { onCreate })),
      )
    })

    // `create` is emitted via a `setTimeout(0)` inside `Editor.mount()`.
    act(() => {
      vi.runAllTimers()
    })

    expect(onCreate).toHaveBeenCalledTimes(1)
  })

  it('still calls onCreate once outside of React.StrictMode', () => {
    vi.useFakeTimers()
    const onCreate = vi.fn()

    act(() => {
      render(React.createElement(TestEditor, { onCreate }))
    })

    act(() => {
      vi.runAllTimers()
    })

    expect(onCreate).toHaveBeenCalledTimes(1)
  })
})
