import { act, renderHook } from '@testing-library/react'
import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { useEditorState } from '@tiptap/react'
import { describe, expect, it } from 'vitest'

function createEditor(content = '<p>hello</p>') {
  return new Editor({
    element: document.createElement('div'),
    extensions: [Document, Paragraph, Text],
    content,
  })
}

function renderEditable(initialEditor: Editor | null) {
  return renderHook(
    ({ editor }: { editor: Editor | null }) =>
      useEditorState({
        editor,
        selector: snapshot => Boolean(snapshot.editor?.isEditable),
      }),
    { initialProps: { editor: initialEditor } },
  )
}

describe('useEditorState editor identity', () => {
  it('sees the editor as soon as it arrives, without waiting for a transaction', () => {
    const { result, rerender } = renderHook(
      ({ editor }: { editor: Editor | null }) =>
        useEditorState({
          editor,
          selector: snapshot => ({
            hasEditor: snapshot.editor !== null,
            isEditable: Boolean(snapshot.editor?.isEditable),
          }),
        }),
      { initialProps: { editor: null as Editor | null } },
    )

    expect(result.current).toEqual({ hasEditor: false, isEditable: false })

    const editor = createEditor()
    act(() => {
      rerender({ editor })
    })

    expect(result.current).toEqual({ hasEditor: true, isEditable: true })

    editor.destroy()
  })

  it('sees the new editor when the instance is replaced', () => {
    const first = createEditor('<p>first</p>')
    const second = createEditor('<p>second</p>')

    const { result, rerender } = renderHook(
      ({ editor }: { editor: Editor | null }) =>
        useEditorState({
          editor,
          selector: snapshot => snapshot.editor?.getText() ?? '',
        }),
      { initialProps: { editor: first as Editor | null } },
    )

    expect(result.current).toBe('first')

    act(() => {
      rerender({ editor: second })
    })
    expect(result.current).toBe('second')

    first.destroy()
    second.destroy()
  })

  it('sees editability changes made before any transaction', () => {
    const editor = createEditor()
    // emitUpdate=false, so the editor arrives non-editable without ever emitting an event.
    editor.setEditable(false, false)

    const { result, rerender } = renderEditable(null)
    expect(result.current).toBe(false)

    act(() => {
      rerender({ editor })
    })
    expect(result.current).toBe(false)

    act(() => {
      editor.setEditable(true)
    })
    expect(result.current).toBe(true)

    editor.destroy()
  })

  it('sees null as soon as the editor is removed', () => {
    const editor = createEditor('<p>abc</p>')

    const { result, rerender } = renderHook(
      ({ editor: currentEditor }: { editor: Editor | null }) =>
        useEditorState({
          editor: currentEditor,
          selector: snapshot => snapshot.editor?.getText() ?? null,
        }),
      { initialProps: { editor: editor as Editor | null } },
    )

    expect(result.current).toBe('abc')

    act(() => {
      rerender({ editor: null })
    })
    expect(result.current).toBeNull()

    editor.destroy()
  })
})
