import { act, cleanup, render, renderHook } from '@testing-library/react'
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import React from 'react'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'

import { EditorContent } from '../../src/EditorContent.js'
import { useEditor } from '../../src/useEditor.js'

describe('useEditor runtime options', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('updates live props and callbacks without forwarding initial options', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const setOptions = vi.spyOn(Editor.prototype, 'setOptions')
    const original = vi.fn()
    const replacement = vi.fn()
    const { result, rerender } = renderHook(
      ({ content, onUpdate, className }) =>
        useEditor({
          extensions: [StarterKit],
          content,
          onUpdate,
          editorProps: { attributes: { class: className } },
        }),
      { initialProps: { content: '<p>Original</p>', onUpdate: original, className: 'original' } },
    )
    const editor = result.current!
    render(React.createElement(EditorContent, { editor }))
    setOptions.mockClear()
    rerender({ content: '<p>Ignored</p>', onUpdate: replacement, className: 'updated' })
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10))
    })
    expect(result.current).toBe(editor)
    expect(editor.getText()).toBe('Original')
    expect(editor.view.dom.classList.contains('updated')).toBe(true)
    for (const [options] of setOptions.mock.calls) {
      expect(options).not.toHaveProperty('content')
      expect(options).not.toHaveProperty('extensions')
    }
    act(() => {
      editor.commands.insertContent('!')
    })
    expect(original).not.toHaveBeenCalled()
    expect(replacement).toHaveBeenCalledTimes(1)
    const latest = vi.fn()
    rerender({ content: '<p>Ignored again</p>', onUpdate: latest, className: 'updated' })
    act(() => {
      editor.commands.insertContent('?')
    })
    expect(replacement).toHaveBeenCalledTimes(1)
    expect(latest).toHaveBeenCalledTimes(1)
    expect(warn).not.toHaveBeenCalled()
  })
})
