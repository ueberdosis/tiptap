import { act, render } from '@testing-library/react'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import React, { StrictMode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useEditor } from './useEditor.js'
import { useEditorState } from './useEditorState.js'

describe('useEditorState', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    document.body.innerHTML = ''
  })

  it('does not call selectors with a null editor during StrictMode remounts', async () => {
    vi.useFakeTimers()

    const selector = vi.fn(ctx => ({
      canRunCommand: ctx.editor.can().chain().run(),
    }))

    function Toolbar() {
      const editor = useEditor({
        extensions: [Document, Paragraph, Text],
      })

      useEditorState({
        editor,
        selector,
      })

      return null
    }

    render(React.createElement(StrictMode, null, React.createElement(Toolbar)))

    await act(async () => {
      await vi.advanceTimersByTimeAsync(10)
    })

    expect(selector).toHaveBeenCalled()
    expect(selector.mock.calls.every(([ctx]) => ctx.editor !== null)).toBe(true)
  })

  it('returns null without calling the selector when the editor is null', () => {
    const selector = vi.fn(ctx => ({
      canRunCommand: ctx.editor.can().chain().run(),
    }))
    let selectedState: { canRunCommand: boolean } | null = null

    function Toolbar() {
      selectedState = useEditorState({
        editor: null,
        selector,
      })

      return null
    }

    render(React.createElement(Toolbar))

    expect(selectedState).toBeNull()
    expect(selector).not.toHaveBeenCalled()
  })
})
