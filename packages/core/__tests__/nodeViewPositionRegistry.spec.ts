import { Editor, cancelPositionCheck, schedulePositionCheck } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('nodeViewPositionRegistry', () => {
  let editor: Editor | null = null
  let animationFrameCallbacks: FrameRequestCallback[] = []

  beforeEach(() => {
    animationFrameCallbacks = []

    vi.stubGlobal(
      'requestAnimationFrame',
      vi.fn((callback: FrameRequestCallback) => {
        animationFrameCallbacks.push(callback)
        return animationFrameCallbacks.length
      }),
    )
    vi.stubGlobal('cancelAnimationFrame', vi.fn())
  })

  afterEach(() => {
    editor?.destroy()
    editor = null
    vi.unstubAllGlobals()
  })

  function createEditor() {
    editor = new Editor({
      extensions: [Document, Paragraph, Text],
      content: '<p>one</p><p>two</p>',
    })

    return editor
  }

  function flushAnimationFrames() {
    const callbacks = animationFrameCallbacks

    animationFrameCallbacks = []
    callbacks.forEach(callback => callback(performance.now()))
  }

  it('does not run position checks for plain text edits', () => {
    const currentEditor = createEditor()
    const callback = vi.fn()

    schedulePositionCheck(currentEditor, callback)
    currentEditor.view.dispatch(currentEditor.state.tr.insertText('x', 2))
    flushAnimationFrames()

    expect(callback).not.toHaveBeenCalled()

    cancelPositionCheck(currentEditor, callback)
  })

  it('runs position checks for structural document changes', () => {
    const currentEditor = createEditor()
    const callback = vi.fn()
    const paragraph = currentEditor.schema.nodes.paragraph.create(null, currentEditor.schema.text('inserted'))

    schedulePositionCheck(currentEditor, callback)
    currentEditor.view.dispatch(currentEditor.state.tr.insert(0, paragraph))
    flushAnimationFrames()

    expect(callback).toHaveBeenCalledOnce()

    cancelPositionCheck(currentEditor, callback)
  })
})
