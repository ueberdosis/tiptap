import type { Editor } from '@tiptap/core'
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

describe('useEditorState', () => {
  it('re-runs the selector per transaction and returns the selected value', async () => {
    const { editor, view } = await renderTiptapEditor('<p>hello</p>')
    const observed = await mountSelector(editor, snapshot => snapshot.editor?.state.doc.textContent)

    expect(observed.value).toBe('hello')

    await act(async () => {
      view.dispatch(view.state.tr.insertText('!', view.state.doc.content.size - 1))
    })

    expect(observed.value).toBe('hello!')
  })

  it('does not re-render when the selected value is deep-equal', async () => {
    const { editor, view } = await renderTiptapEditor('<p>hello</p>')
    const observed = await mountSelector(editor, snapshot => ({
      empty: snapshot.editor?.state.doc.textContent === '',
    }))
    const rendersBefore = observed.renders

    await act(async () => {
      view.dispatch(view.state.tr.insertText('!', view.state.doc.content.size - 1))
    })

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

    await act(async () => {
      view.dispatch(view.state.tr.insertText('!', view.state.doc.content.size - 1))
    })

    expect(observed.value).toBe('hello')
  })

  it('returns the selector result over a null editor', async () => {
    const observed = await mountSelector(null, snapshot => snapshot.editor ?? 'no-editor')

    expect(observed.value).toBe('no-editor')
  })
})
