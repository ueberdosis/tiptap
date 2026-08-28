import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { describe, expect, it, vi } from 'vite-plus/test'

const createEditor = () => {
  return new Editor({
    extensions: [Document, Paragraph, Text],
    content: '<p>first</p><p>second</p>',
  })
}

describe('VisualSelectionStore', () => {
  it('returns null when nothing is selected', () => {
    const editor = createEditor()

    expect(editor.visualSelection.getSnapshot()).toBeNull()

    editor.destroy()
  })

  it('stores the position and node size on set', () => {
    const editor = createEditor()

    editor.visualSelection.set(7)

    expect(editor.visualSelection.getSnapshot()).toEqual({ pos: 7, nodeSize: 8 })

    editor.destroy()
  })

  it('clears when set with a position that has no node', () => {
    const editor = createEditor()

    editor.visualSelection.set(7)
    editor.visualSelection.set(1000)

    expect(editor.visualSelection.getSnapshot()).toBeNull()

    editor.destroy()
  })

  it('does not dispatch a transaction or touch state.selection', () => {
    const editor = createEditor()
    const selectionBefore = editor.state.selection

    editor.visualSelection.set(7)

    expect(editor.state.selection).toBe(selectionBefore)

    editor.destroy()
  })

  it('remaps the position when content is inserted before it without moving the real selection', () => {
    const editor = createEditor()

    editor.visualSelection.set(7)
    const selectionBefore = editor.state.selection

    // Insert directly via a transaction so the real selection maps through
    // unaffected, unlike a command such as insertContentAt which also
    // moves the cursor to right after the inserted content.
    editor.view.dispatch(editor.state.tr.insertText('XX', 3))

    expect(editor.state.selection.eq(selectionBefore)).toBe(true)
    expect(editor.visualSelection.getSnapshot()).toEqual({ pos: 9, nodeSize: 8 })

    editor.destroy()
  })

  it('clears when the selected node is deleted', () => {
    const editor = createEditor()

    editor.visualSelection.set(7)
    editor.commands.deleteRange({ from: 7, to: 7 + 8 })

    expect(editor.visualSelection.getSnapshot()).toBeNull()

    editor.destroy()
  })

  it('clears when the real editor selection changes', () => {
    const editor = createEditor()

    editor.visualSelection.set(7)
    editor.commands.setTextSelection(3)

    expect(editor.visualSelection.getSnapshot()).toBeNull()

    editor.destroy()
  })

  it('notifies subscribers only when the snapshot actually changes', () => {
    const editor = createEditor()
    const listener = vi.fn()

    const unsubscribe = editor.visualSelection.subscribe(listener)

    editor.visualSelection.set(7)
    editor.visualSelection.set(7)
    expect(listener).toHaveBeenCalledTimes(1)

    editor.visualSelection.clear()
    editor.visualSelection.clear()
    expect(listener).toHaveBeenCalledTimes(2)

    unsubscribe()
    editor.visualSelection.set(7)
    expect(listener).toHaveBeenCalledTimes(2)

    editor.destroy()
  })
})
