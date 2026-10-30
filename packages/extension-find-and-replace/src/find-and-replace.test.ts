import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'

import { FindAndReplace } from './find-and-replace.js'
import type { FindAndReplaceOptions } from './types.js'

describe('result navigation', () => {
  let editor: Editor

  const createEditor = (content: string, options: Partial<FindAndReplaceOptions> = {}) => {
    return new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        FindAndReplace.configure({ searchDebounceMs: 0, ...options }),
      ],
      content,
    })
  }

  const selectedText = () => {
    const { from, to } = editor.state.selection

    return editor.state.doc.textBetween(from, to)
  }

  afterEach(() => {
    editor.destroy()
    vi.useRealTimers()
  })

  it('goes to the first result on the first next', () => {
    editor = createEditor('<p>one two one</p>')
    editor.commands.setSearchTerm('one')

    expect(editor.storage.findAndReplace.currentIndex).toBe(0)

    editor.commands.goToNextResult()

    expect(editor.storage.findAndReplace.currentIndex).toBe(0)
    expect(editor.state.selection.from).toBe(1)
    expect(selectedText()).toBe('one')

    editor.commands.goToNextResult()

    expect(editor.storage.findAndReplace.currentIndex).toBe(1)
    expect(editor.state.selection.from).toBe(9)
  })

  it('goes to the first result on the first previous', () => {
    editor = createEditor('<p>one two one</p>')
    editor.commands.setSearchTerm('one')
    editor.commands.goToPreviousResult()

    expect(editor.storage.findAndReplace.currentIndex).toBe(0)
    expect(editor.state.selection.from).toBe(1)

    editor.commands.goToPreviousResult()

    expect(editor.storage.findAndReplace.currentIndex).toBe(1)
    expect(editor.state.selection.from).toBe(9)
  })

  it('goes to the first result again after the search term changes', () => {
    editor = createEditor('<p>one two one two</p>')
    editor.commands.setSearchTerm('one')
    editor.commands.goToNextResult()
    editor.commands.goToNextResult()
    editor.commands.setSearchTerm('two')
    editor.commands.goToNextResult()

    expect(editor.storage.findAndReplace.currentIndex).toBe(0)
    expect(editor.state.selection.from).toBe(5)
  })

  it('goes to the first result of a pending search', () => {
    vi.useFakeTimers()
    editor = createEditor('<p>one two one</p>', { searchDebounceMs: 250 })
    editor.commands.setSearchTerm('one')
    editor.commands.goToNextResult()

    expect(editor.storage.findAndReplace.currentIndex).toBe(0)
    expect(editor.state.selection.from).toBe(1)
  })

  it('keeps stepping forward after an edit outside the current result', () => {
    editor = createEditor('<p>one two one two one</p>')
    editor.commands.setSearchTerm('one')
    editor.commands.goToNextResult()
    editor.commands.goToNextResult()
    editor.commands.insertContentAt(1, 'x')
    editor.commands.goToNextResult()

    expect(editor.storage.findAndReplace.currentIndex).toBe(2)
  })

  it('goes to a new current result after the visited one is removed', () => {
    editor = createEditor('<p>one two one two one</p>')
    editor.commands.setSearchTerm('one')
    editor.commands.goToNextResult()
    editor.commands.goToNextResult()
    editor.commands.deleteRange({ from: 9, to: 12 })

    expect(editor.storage.findAndReplace.currentIndex).toBe(1)

    editor.commands.goToNextResult()

    expect(editor.storage.findAndReplace.currentIndex).toBe(1)
    expect(selectedText()).toBe('one')
  })
})
