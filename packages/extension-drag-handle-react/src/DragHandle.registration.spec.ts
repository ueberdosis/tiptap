import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { useEditorState } from '@tiptap/react'
import { act, render } from '@testing-library/react'
import React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { DragHandle } from './DragHandle.js'

function createRealEditor() {
  const element = document.createElement('div')
  document.body.appendChild(element)

  return new Editor({
    element,
    extensions: [Document, Paragraph, Text],
    content: '<p>hello world</p>',
  })
}

describe('DragHandle plugin registration stability', () => {
  let editor: Editor

  afterEach(() => {
    editor?.destroy()
    document.body.innerHTML = ''
  })

  // Re-registering mid-drag tears the handle out of the DOM and breaks dragging.
  it('does not re-register the plugin on transactions when onNodeChange is an unstable inline callback', () => {
    editor = createRealEditor()
    const register = vi.spyOn(editor, 'registerPlugin')
    const unregister = vi.spyOn(editor, 'unregisterPlugin')

    function Parent({ editor: ed }: { editor: Editor }) {
      // Re-render on every transaction, like real apps using useEditor/useEditorState.
      useEditorState({ editor: ed, selector: s => s.transactionNumber })
      return React.createElement(DragHandle, {
        editor: ed,
        // A fresh arrow function on every render (the reporter's code).
        onNodeChange: () => {},
        children: React.createElement('span', null, 'handle'),
      } as never)
    }

    act(() => {
      render(React.createElement(Parent, { editor }))
    })

    const registersAfterMount = register.mock.calls.length
    expect(registersAfterMount).toBe(1)

    for (let i = 0; i < 5; i += 1) {
      act(() => {
        editor.view.dispatch(editor.state.tr.insertText('x', 1))
      })
    }

    expect(register.mock.calls.length).toBe(1)
    expect(unregister.mock.calls.length).toBe(0)
  })

  // The ref must still forward to the latest callback.
  it('still invokes onNodeChange through the stable wrapper', () => {
    editor = createRealEditor()
    const seen: Array<{ node: unknown; pos: number }> = []

    function Parent({ editor: ed }: { editor: Editor }) {
      useEditorState({ editor: ed, selector: s => s.transactionNumber })
      return React.createElement(DragHandle, {
        editor: ed,
        onNodeChange: (data: { node: unknown; pos: number }) => seen.push(data),
        children: React.createElement('span', null, 'handle'),
      } as never)
    }

    act(() => {
      render(React.createElement(Parent, { editor }))
    })

    // `hideDragHandle` meta triggers onNodeChange(null, -1) in the plugin.
    act(() => {
      editor.view.dispatch(editor.state.tr.setMeta('hideDragHandle', true))
    })

    expect(seen.length).toBeGreaterThan(0)
    expect(seen.at(-1)).toMatchObject({ node: null, pos: -1 })
  })
})
