import { renderHook } from '@testing-library/react'
import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { describe, expect, it, vi } from 'vitest'

import { useEditorState } from '../useEditorState.js'

function createEditor() {
  return new Editor({
    extensions: [Document, Paragraph, Text],
  })
}

describe('useEditorState', () => {
  it('should return selector result for the current editor', () => {
    const editor = createEditor()

    const { result } = renderHook(() =>
      useEditorState({
        editor,
        selector: ({ editor: e }) => e?.isDestroyed ?? null,
      }),
    )

    expect(result.current).toBe(false)
    editor.destroy()
  })

  it('should not run selector against a destroyed editor when editor instance changes', () => {
    const editorA = createEditor()
    const editorB = createEditor()
    let currentEditor: Editor | null = editorA

    const selectorCalls: boolean[] = []
    const selector = vi.fn(({ editor: e }: { editor: Editor | null; transactionNumber: number }) => {
      const isDestroyed = e?.isDestroyed ?? null
      selectorCalls.push(isDestroyed === true)
      // In the bug scenario, the selector would receive the destroyed editorA
      // and accessing editorA.view would throw
      return isDestroyed
    })

    const { result, rerender } = renderHook(() =>
      useEditorState({
        editor: currentEditor,
        selector,
        // Use reference equality to avoid deepEqual on complex objects
        equalityFn: (a, b) => a === b,
      }),
    )

    expect(result.current).toBe(false)

    // Simulate what happens when useEditor recreates the editor:
    // old editor is destroyed, new editor is provided
    editorA.destroy()
    currentEditor = editorB

    // This rerender should NOT cause the selector to run on the destroyed editorA
    rerender()

    expect(result.current).toBe(false)
    // Verify the selector was never called with a destroyed editor
    expect(selectorCalls.every(wasDestroyed => wasDestroyed === false)).toBe(true)

    editorB.destroy()
  })

  it('should handle editor changing to null', () => {
    const editor = createEditor()
    let currentEditor: Editor | null = editor

    const { result, rerender } = renderHook(() =>
      useEditorState({
        editor: currentEditor,
        selector: ({ editor: e }) => e?.isDestroyed ?? null,
        equalityFn: (a, b) => a === b,
      }),
    )

    expect(result.current).toBe(false)

    editor.destroy()
    currentEditor = null
    rerender()

    expect(result.current).toBeNull()
  })

  it('should handle editor changing from null to an instance', () => {
    let currentEditor: Editor | null = null

    const { result, rerender } = renderHook(() =>
      useEditorState({
        editor: currentEditor,
        selector: ({ editor: e }) => e?.isDestroyed ?? null,
        equalityFn: (a, b) => a === b,
      }),
    )

    expect(result.current).toBeNull()

    currentEditor = createEditor()
    rerender()

    expect(result.current).toBe(false)

    currentEditor.destroy()
  })
})
