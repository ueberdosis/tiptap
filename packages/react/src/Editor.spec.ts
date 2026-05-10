import type { EditorState } from '@tiptap/pm/state'
import { describe, expect, it, vi } from 'vitest'

import { Editor } from './Editor.js'

function createEditor() {
  const editor = Object.create(Editor.prototype) as Editor
  const beginTransactionRenderBatch = vi.fn()
  const endTransactionRenderBatch = vi.fn()
  const updateState = vi.fn()

  editor.contentComponent = {
    beginTransactionRenderBatch,
    endTransactionRenderBatch,
  } as never

  Object.defineProperty(editor, 'view', {
    configurable: true,
    value: {
      updateState,
    },
  })

  return {
    editor,
    beginTransactionRenderBatch,
    endTransactionRenderBatch,
    updateState,
  }
}

describe('React Editor batching', () => {
  it('wraps each view update in a transaction render batch', () => {
    const { editor, beginTransactionRenderBatch, endTransactionRenderBatch, updateState } = createEditor()

    ;(editor as any).updateViewState({} as EditorState)

    expect(beginTransactionRenderBatch).toHaveBeenCalledTimes(1)
    expect(updateState).toHaveBeenCalledTimes(1)
    expect(endTransactionRenderBatch).toHaveBeenCalledTimes(1)
    expect(beginTransactionRenderBatch.mock.invocationCallOrder[0]).toBeLessThan(
      updateState.mock.invocationCallOrder[0],
    )
    expect(updateState.mock.invocationCallOrder[0]).toBeLessThan(endTransactionRenderBatch.mock.invocationCallOrder[0])
  })

  it('ends the batch even when the view update throws', () => {
    const { editor, beginTransactionRenderBatch, endTransactionRenderBatch, updateState } = createEditor()

    updateState.mockImplementation(() => {
      throw new Error('boom')
    })

    expect(() => {
      ;(editor as any).updateViewState({} as EditorState)
    }).toThrow('boom')

    expect(beginTransactionRenderBatch).toHaveBeenCalledTimes(1)
    expect(updateState).toHaveBeenCalledTimes(1)
    expect(endTransactionRenderBatch).toHaveBeenCalledTimes(1)
  })
})
