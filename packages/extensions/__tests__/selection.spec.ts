import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { Selection } from '@tiptap/extensions'
import { afterEach, describe, expect, it, vi } from 'vitest'

describe('extension-selection', () => {
  let editor: Editor | null = null

  afterEach(() => {
    editor?.destroy()
    editor = null
    vi.restoreAllMocks()
  })

  it('clears the native selection on blur', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, Selection],
      content: '<p>Hello world</p>',
    })

    editor.commands.setTextSelection({ from: 1, to: 6 })

    const button = document.createElement('button')

    document.body.append(button)

    editor.view.dom.blur()
    button.focus()

    const domSelection = window.getSelection()

    expect(domSelection?.isCollapsed ?? true).toBe(true)

    button.remove()
  })

  it('adds selection decorations when blurred with a non-empty selection', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, Selection],
      content: '<p>Hello world</p>',
    })

    editor.commands.setTextSelection({ from: 1, to: 6 })

    const button = document.createElement('button')

    document.body.append(button)

    editor.view.dom.blur()
    button.focus()

    expect(editor.view.dom.querySelector('.selection')).not.toBeNull()

    button.remove()
  })

  it('does not clear or restore the DOM selection when the editor is not editable', async () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, Selection],
      content: '<p>Hello world</p>',
      editable: false,
    })

    const removeAllRanges = vi.fn()
    const focusSpy = vi.spyOn(editor.view, 'focus')

    vi.spyOn(window, 'getSelection').mockReturnValue({
      removeAllRanges,
    } as unknown as Selection)

    editor.commands.setTextSelection({ from: 1, to: 6 })

    const button = document.createElement('button')

    document.body.append(button)

    editor.view.dom.blur()
    button.focus()

    expect(removeAllRanges).not.toHaveBeenCalled()

    editor.view.dom.focus()

    await new Promise<void>(resolve => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => resolve())
      })
    })

    expect(focusSpy).not.toHaveBeenCalled()

    button.remove()
  })
})
