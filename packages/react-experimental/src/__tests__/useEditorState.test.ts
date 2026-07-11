import type { Editor } from '@tiptap/core'
import type { EditorState } from '@tiptap/pm/state'
import { act, createElement } from 'react'
import { afterEach, describe, expect, it } from 'vitest'

import { useEditorState } from '../useEditorState.js'
import { mountTrackedRoot, renderTiptapEditor, unmountTrackedRoots } from './helpers.js'

afterEach(unmountTrackedRoots)

/** Renders a probe component running `useEditorState` against `editor`. */
const mountSelector = async <T>(
  editor: Editor | null,
  selector: (snapshot: { editor: Editor | null; transactionNumber: number }) => T,
  equalityFn?: (a: T, b: T | null) => boolean,
) => {
  const observed: { renders: number; value: T | null } = { renders: 0, value: null }
  const Probe = () => {
    observed.renders += 1
    observed.value = useEditorState({ editor, selector, equalityFn })
    return null
  }
  const { root } = mountTrackedRoot()

  await act(async () => {
    root.render(createElement(Probe))
  })
  return observed
}

/** Appends "!" to the document, inside act(). */
const typeExclamation = (view: { dispatch: (tr: unknown) => void; state: EditorState }) =>
  act(async () => {
    view.dispatch(view.state.tr.insertText('!', view.state.doc.content.size - 1))
  })

describe('useEditorState', () => {
  it('re-runs the selector per transaction and returns the selected value', async () => {
    const { editor, view } = await renderTiptapEditor('<p>hello</p>')
    const observed = await mountSelector(editor, snapshot => snapshot.editor?.state.doc.textContent)

    expect(observed.value).toBe('hello')

    await typeExclamation(view)

    expect(observed.value).toBe('hello!')
  })

  it('does not re-render when the selected value is deep-equal', async () => {
    const { editor, view } = await renderTiptapEditor('<p>hello</p>')
    const observed = await mountSelector(editor, snapshot => ({
      empty: snapshot.editor?.state.doc.textContent === '',
    }))
    const rendersBefore = observed.renders

    await typeExclamation(view)

    // Selector result {empty: false} is structurally unchanged
    expect(observed.renders).toBe(rendersBefore)
  })

  it('honors a custom equality function', async () => {
    const { editor, view } = await renderTiptapEditor('<p>hello</p>')
    const observed = await mountSelector(
      editor,
      snapshot => snapshot.editor?.state.doc.textContent,
      // Treat every value as equal: never re-render
      () => true,
    )

    await typeExclamation(view)

    expect(observed.value).toBe('hello')
  })

  it('returns the selector result over a null editor', async () => {
    const observed = await mountSelector(null, snapshot => snapshot.editor ?? 'no-editor')

    expect(observed.value).toBe('no-editor')
  })

  it('serves the new editor immediately after an editor swap', async () => {
    const { editor: editorA } = await renderTiptapEditor('<p>first</p>')
    const { editor: editorB } = await renderTiptapEditor('<p>second</p>')
    const observed: { value: string | undefined } = { value: undefined }
    const Probe = ({ editor }: { editor: Editor }) => {
      observed.value = useEditorState({
        editor,
        selector: snapshot => snapshot.editor?.state.doc.textContent,
      }) as string | undefined
      return null
    }
    const { root } = mountTrackedRoot()

    await act(async () => {
      root.render(createElement(Probe, { editor: editorA }))
    })
    expect(observed.value).toBe('first')

    // No transaction on editorB: the swap alone must refresh the snapshot
    await act(async () => {
      root.render(createElement(Probe, { editor: editorB }))
    })
    expect(observed.value).toBe('second')
  })

  it('resolves a null to editor transition without a transaction', async () => {
    const { editor } = await renderTiptapEditor('<p>late</p>')
    const observed: { value: string | null | undefined } = { value: undefined }
    const Probe = ({ editor: current }: { editor: Editor | null }) => {
      observed.value = useEditorState({
        editor: current,
        selector: snapshot => snapshot.editor?.state.doc.textContent ?? null,
      })
      return null
    }
    const { root } = mountTrackedRoot()

    await act(async () => {
      root.render(createElement(Probe, { editor: null }))
    })
    expect(observed.value).toBeNull()

    await act(async () => {
      root.render(createElement(Probe, { editor }))
    })
    expect(observed.value).toBe('late')
  })

  it('does not notify subscribers when re-watching the same editor', async () => {
    const { editor } = await renderTiptapEditor('<p>same</p>')
    const observed = { renders: 0 }
    const Probe = ({ tick: _tick }: { tick: number }) => {
      observed.renders += 1
      useEditorState({ editor, selector: snapshot => snapshot.editor?.state.doc.textContent })
      return null
    }
    const { root } = mountTrackedRoot()

    await act(async () => {
      root.render(createElement(Probe, { tick: 1 }))
    })
    const rendersBefore = observed.renders

    // Re-render with the same editor: watch() must stay silent
    await act(async () => {
      root.render(createElement(Probe, { tick: 2 }))
    })
    expect(observed.renders).toBe(rendersBefore + 1)
  })
})
