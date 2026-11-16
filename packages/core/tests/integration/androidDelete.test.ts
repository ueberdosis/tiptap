import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import TextExtension from '@tiptap/extension-text'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'

vi.hoisted(() => {
  Object.defineProperty(navigator, 'userAgent', {
    configurable: true,
    value: 'Mozilla/5.0 (Linux; Android 14) Chrome/145.0.0.0',
  })
})

describe('Android native Backspace', () => {
  let editor: Editor

  afterEach(() => {
    editor?.destroy()
    document.body.replaceChildren()
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it.each([false, true])(
    'reconciles deletion before focus restores the caret (composing: %s)',
    composing => {
      vi.useFakeTimers()
      editor = new Editor({
        extensions: [Document, Paragraph, TextExtension],
        content: '<p>First paragraph</p><p>Second paragraph</p>',
      })
      document.body.append(editor.view.dom)
      editor.commands.setTextSelection(34)
      editor.view.focus()

      if (composing) {
        editor.view.dispatchEvent(new CompositionEvent('compositionstart'))
      }

      editor.view.dom.dispatchEvent(
        new InputEvent('beforeinput', {
          inputType: 'deleteContentBackward',
          bubbles: true,
        }),
      )
      const text = editor.view.dom.lastElementChild!.firstChild as Text

      text.deleteData(15, 1)
      document.getSelection()!.collapse(text, 15)
      const event = new InputEvent('input', {
        inputType: 'deleteContentBackward',
        bubbles: true,
        isComposing: composing,
      })

      editor.view.dom.dispatchEvent(event)

      expect(editor.getText()).toBe('First paragraph\n\nSecond paragrap')
      expect(editor.state.selection.from).toBe(33)
      expect(event.defaultPrevented).toBe(false)
      expect(() => vi.advanceTimersByTime(60)).not.toThrow()
      expect(editor.getText()).toBe('First paragraph\n\nSecond paragrap')
      expect(editor.state.selection.from).toBe(33)
    },
  )
})
