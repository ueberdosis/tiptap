import type { JSONContent } from '@tiptap/core'
import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'

import { ContinuedParagraph } from '../tests/utils/ContinuedParagraph.js'
import { continuesNode, paragraph } from '../tests/utils/createContinuedDoc.js'
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

describe('continued textblocks', () => {
  let editor: Editor

  const createEditor = (paragraphs: JSONContent[]) => {
    return new Editor({
      extensions: [
        Document,
        ContinuedParagraph,
        Text,
        FindAndReplace.configure({ searchDebounceMs: 0, continuesNode }),
      ],
      content: { type: 'doc', content: paragraphs },
    })
  }

  afterEach(() => {
    editor.destroy()
  })

  it('highlights a result in both textblocks', () => {
    editor = createEditor([paragraph('find the '), paragraph('phrase here', true)])
    editor.commands.setSearchTerm('the phrase')

    const highlights = editor.view.dom.querySelectorAll('.find-and-replace-result')

    expect(editor.storage.findAndReplace.results).toEqual([{ from: 6, to: 18 }])
    expect([...highlights].map(highlight => highlight.textContent)).toEqual(['the ', 'phrase'])
  })

  it('selects a result across the boundary', () => {
    editor = createEditor([paragraph('find the '), paragraph('phrase here', true)])
    editor.commands.setSearchTerm('the phrase')
    editor.commands.goToNextResult()

    expect(editor.state.selection.from).toBe(6)
    expect(editor.state.selection.to).toBe(18)
  })

  it('replaces a result across the boundary', () => {
    editor = createEditor([paragraph('find the '), paragraph('phrase here', true)])
    editor.commands.setSearchTerm('the phrase')
    editor.commands.setReplaceTerm('a word')
    editor.commands.replace()

    expect(editor.getText()).toBe('find a word here')
    expect(editor.storage.findAndReplace.results).toEqual([])
  })

  it('replaces all results across the boundary', () => {
    editor = createEditor([paragraph('one the '), paragraph('phrase the phrase', true)])
    editor.commands.setSearchTerm('the phrase')
    editor.commands.setReplaceTerm('it')
    editor.commands.replaceAll()

    expect(editor.getText()).toBe('one it it')
  })

  it('updates a result when the continued textblock changes', () => {
    editor = createEditor([paragraph('find the '), paragraph('phrase here', true)])
    editor.commands.setSearchTerm('the phrase')
    editor.commands.insertContentAt(14, 'x')

    expect(editor.storage.findAndReplace.results).toEqual([])

    editor.commands.deleteRange({ from: 14, to: 15 })

    expect(editor.storage.findAndReplace.results).toEqual([{ from: 6, to: 18 }])
    expect(editor.view.dom.querySelectorAll('.find-and-replace-result')).toHaveLength(2)
  })

  it('keeps one result when the first textblock changes', () => {
    editor = createEditor([paragraph('find the '), paragraph('phrase here', true)])
    editor.commands.setSearchTerm('the phrase')
    editor.commands.insertContentAt(1, 'x')

    expect(editor.storage.findAndReplace.results).toEqual([{ from: 7, to: 19 }])
    expect(editor.view.dom.querySelectorAll('.find-and-replace-result')).toHaveLength(2)
  })

  it('drops a result when the textblock stops continuing', () => {
    editor = createEditor([paragraph('find the '), paragraph('phrase here', true)])
    editor.commands.setSearchTerm('the phrase')
    editor.view.dispatch(editor.state.tr.setNodeAttribute(11, 'continued', false))

    expect(editor.storage.findAndReplace.results).toEqual([])
    expect(editor.view.dom.querySelectorAll('.find-and-replace-result')).toHaveLength(0)
  })

  it('finds a result when a textblock starts continuing', () => {
    editor = createEditor([paragraph('find the '), paragraph('phrase here')])
    editor.commands.setSearchTerm('the phrase')
    editor.view.dispatch(editor.state.tr.setNodeAttribute(11, 'continued', true))

    expect(editor.storage.findAndReplace.results).toEqual([{ from: 6, to: 18 }])
  })
})
