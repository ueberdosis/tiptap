import { Editor } from '@tiptap/core'
import Bold from '@tiptap/extension-bold'
import Document from '@tiptap/extension-document'
import FindAndReplace, { createSearchRegex } from '@tiptap/extension-find-and-replace'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

describe('FindAndReplace', () => {
  let editor: Editor

  const createEditor = (content: string) => {
    const element = document.createElement('div')
    document.body.appendChild(element)

    return new Editor({
      element,
      extensions: [Document, Paragraph, Text, Bold, FindAndReplace],
      content,
    })
  }

  beforeEach(() => {
    editor = createEditor('<p>Hello hello HELLO</p>')
  })

  afterEach(() => {
    editor.destroy()
  })

  it('finds matches case insensitively by default', () => {
    editor.commands.setSearchTerm('hello')

    expect(editor.storage.findAndReplace.results).toEqual([
      { from: 1, to: 6 },
      { from: 7, to: 12 },
      { from: 13, to: 18 },
    ])
    expect(editor.storage.findAndReplace.currentIndex).toBe(0)
  })

  it('syncs the search term to the storage', () => {
    editor.commands.setSearchTerm('hello')

    expect(editor.storage.findAndReplace.searchTerm).toBe('hello')
  })

  it('syncs initial search results to the storage', () => {
    editor.destroy()
    editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        Bold,
        FindAndReplace.configure({ searchTerm: 'hello' }),
      ],
      content: '<p>Hello hello HELLO</p>',
    })

    expect(editor.storage.findAndReplace.results).toEqual([
      { from: 1, to: 6 },
      { from: 7, to: 12 },
      { from: 13, to: 18 },
    ])
  })

  it('finds only exact matches when case sensitive', () => {
    editor.commands.setSearchTerm('hello')
    editor.commands.setCaseSensitive(true)

    expect(editor.storage.findAndReplace.results).toEqual([{ from: 7, to: 12 }])
  })

  it('supports regular expressions', () => {
    editor.commands.setUseRegex(true)
    editor.commands.setSearchTerm('h.llo')

    expect(editor.storage.findAndReplace.results).toHaveLength(3)
  })

  it('supports Unicode property escapes in regex mode', () => {
    editor.destroy()
    editor = createEditor('<p>café 123</p>')
    editor.commands.setUseRegex(true)
    editor.commands.setSearchTerm('\\p{L}+')

    expect(editor.storage.findAndReplace.results).toEqual([{ from: 1, to: 5 }])
  })

  it('matches an emoji as one character in regex mode', () => {
    editor.destroy()
    editor = createEditor('<p>😀</p>')
    editor.commands.setUseRegex(true)
    editor.commands.setSearchTerm('.')

    expect(editor.storage.findAndReplace.results).toEqual([{ from: 1, to: 3 }])
  })

  it('returns no results for an invalid regular expression', () => {
    editor.commands.setUseRegex(true)
    editor.commands.setSearchTerm('([')

    expect(editor.storage.findAndReplace.results).toEqual([])
  })

  it('finds matches across marks', () => {
    editor.destroy()
    editor = createEditor('<p>he<strong>llo</strong> world</p>')
    editor.commands.setSearchTerm('hello')

    expect(editor.storage.findAndReplace.results).toEqual([{ from: 1, to: 6 }])
  })

  it('renders decorations for all results', () => {
    editor.commands.setSearchTerm('hello')

    const results = editor.view.dom.querySelectorAll('.find-and-replace-result')
    const current = editor.view.dom.querySelectorAll('.find-and-replace-result-current')

    expect(results).toHaveLength(3)
    expect(current).toHaveLength(1)
  })

  it('updates results when the document changes', () => {
    editor.commands.setSearchTerm('hello')
    editor.commands.setContent('<p>hello hello</p>')

    expect(editor.storage.findAndReplace.results).toHaveLength(2)
  })

  it('updates only the matches in a changed textblock', () => {
    editor.destroy()
    editor = createEditor('<p>foo</p><p>foo</p><p>foo</p>')
    editor.commands.setSearchTerm('foo')

    editor.commands.insertContentAt(2, 'x')

    expect(editor.storage.findAndReplace.results).toEqual([
      { from: 7, to: 10 },
      { from: 12, to: 15 },
    ])
    expect(editor.view.dom.querySelectorAll('.find-and-replace-result')).toHaveLength(2)
  })

  it('removes mapped matches from a deleted textblock', () => {
    editor.destroy()
    editor = createEditor('<p>foo</p><p>foo</p>')
    editor.commands.setSearchTerm('foo')

    editor.view.dispatch(editor.state.tr.delete(0, 5))

    expect(editor.storage.findAndReplace.results).toEqual([{ from: 1, to: 4 }])
    expect(editor.view.dom.querySelectorAll('.find-and-replace-result')).toHaveLength(1)
  })

  it('updates whole-word matches at a changed textblock boundary', () => {
    editor.destroy()
    editor = createEditor('<p>hello</p><p>hello</p>')
    editor.commands.setSearchTerm('hello')
    editor.commands.setWholeWord(true)

    editor.commands.insertContentAt(6, 'x')

    expect(editor.storage.findAndReplace.results).toEqual([{ from: 9, to: 14 }])
  })

  it('selects the first result created by a document change', () => {
    editor.commands.setSearchTerm('world')
    editor.commands.setContent('<p>world</p>')

    expect(editor.storage.findAndReplace.currentIndex).toBe(0)
    expect(editor.view.dom.querySelectorAll('.find-and-replace-result-current')).toHaveLength(1)
  })

  it('selects the first result when text is inserted after setting the search term', () => {
    editor.destroy()
    editor = createEditor('<p></p>')
    editor.commands.setSearchTerm('hello')

    expect(editor.storage.findAndReplace.currentIndex).toBeNull()

    editor.commands.insertContent('hello')

    expect(editor.storage.findAndReplace.results).toEqual([{ from: 1, to: 6 }])
    expect(editor.storage.findAndReplace.currentIndex).toBe(0)
    expect(editor.view.dom.querySelectorAll('.find-and-replace-result-current')).toHaveLength(1)
  })

  it('clears results and decorations on clearSearch', () => {
    editor.commands.setSearchTerm('hello')
    editor.commands.clearSearch()

    expect(editor.storage.findAndReplace.results).toEqual([])
    expect(editor.view.dom.querySelectorAll('.find-and-replace-result')).toHaveLength(0)
  })

  it('navigates results with wrap around', () => {
    editor.destroy()
    editor = createEditor('<p>one two one two one</p>')
    editor.commands.setSearchTerm('one')

    expect(editor.storage.findAndReplace.currentIndex).toBe(0)

    editor.commands.goToNextResult()
    expect(editor.storage.findAndReplace.currentIndex).toBe(1)
    expect(editor.state.selection.from).toBe(9)
    expect(editor.state.selection.to).toBe(12)

    editor.commands.goToNextResult()
    editor.commands.goToNextResult()
    expect(editor.storage.findAndReplace.currentIndex).toBe(0)

    editor.commands.goToPreviousResult()
    expect(editor.storage.findAndReplace.currentIndex).toBe(2)
  })

  it('replaces the current result and jumps to the next one', () => {
    editor.destroy()
    editor = createEditor('<p>foo bar foo</p>')
    editor.commands.setSearchTerm('foo')
    editor.commands.setReplaceTerm('baz')
    editor.commands.replace()

    expect(editor.getText()).toBe('baz bar foo')
    expect(editor.storage.findAndReplace.results).toEqual([{ from: 9, to: 12 }])
    expect(editor.storage.findAndReplace.currentIndex).toBe(0)
    expect(editor.state.selection.from).toBe(9)
    expect(editor.state.selection.to).toBe(12)
  })

  it('skips a replacement that still matches the search term', () => {
    editor.destroy()
    editor = createEditor('<p>foo bar foo</p>')
    editor.commands.setSearchTerm('foo')
    editor.commands.setReplaceTerm('foobar')
    editor.commands.replace()

    expect(editor.getText()).toBe('foobar bar foo')
    expect(editor.storage.findAndReplace.currentIndex).toBe(1)
    expect(editor.state.selection.from).toBe(12)
    expect(editor.state.selection.to).toBe(15)
  })

  it('wraps around when replacing the last result', () => {
    editor.destroy()
    editor = createEditor('<p>foo bar foo</p>')
    editor.commands.setSearchTerm('foo')
    editor.commands.setReplaceTerm('foo')
    editor.commands.goToNextResult()
    editor.commands.replace()

    expect(editor.getText()).toBe('foo bar foo')
    expect(editor.storage.findAndReplace.currentIndex).toBe(0)
  })

  it('replaces all results at once', () => {
    editor.commands.setSearchTerm('hello')
    editor.commands.setReplaceTerm('world')
    editor.commands.replaceAll()

    expect(editor.getText()).toBe('world world world')
    expect(editor.storage.findAndReplace.results).toEqual([])
    expect(editor.storage.findAndReplace.currentIndex).toBeNull()
  })

  it('keeps new results when the replacement still matches', () => {
    editor.commands.setSearchTerm('hello')
    editor.commands.setReplaceTerm('hello!')
    editor.commands.replaceAll()

    expect(editor.getText()).toBe('hello! hello! hello!')
    expect(editor.storage.findAndReplace.results).toEqual([
      { from: 1, to: 6 },
      { from: 8, to: 13 },
      { from: 15, to: 20 },
    ])
  })

  it('does nothing on replace without results', () => {
    expect(editor.commands.replace()).toBe(false)
    expect(editor.commands.replaceAll()).toBe(false)
  })

  it('handles nested quantifiers with the safe regex engine', () => {
    editor.destroy()
    editor = createEditor('<p>aaaa</p>')
    editor.commands.setUseRegex(true)
    editor.commands.setSearchTerm('(a+)+')

    expect(editor.storage.findAndReplace.results).toEqual([{ from: 1, to: 5 }])
  })

  it('handles overlapping alternatives without catastrophic backtracking', () => {
    editor.destroy()
    editor = createEditor(`<p>${'a'.repeat(40)}!</p>`)
    editor.commands.setUseRegex(true)
    editor.commands.setSearchTerm('^(a|aa)+$')

    expect(editor.storage.findAndReplace.results).toEqual([])
  })

  it('creates a safe matcher for regex mode', () => {
    const regex = createSearchRegex('^(a|aa)+$', {
      caseSensitive: true,
      useRegex: true,
      wholeWord: false,
    })

    expect(regex).not.toBeNull()
    expect(regex).not.toBeInstanceOf(RegExp)
  })

  it('returns no results for unsupported regex syntax', () => {
    editor.commands.setUseRegex(true)
    editor.commands.setSearchTerm('(?=hello)hello')

    expect(editor.storage.findAndReplace.results).toEqual([])

    editor.commands.setSearchTerm('(hello)\\1')

    expect(editor.storage.findAndReplace.results).toEqual([])
  })

  it('finds only whole words when wholeWord is enabled', () => {
    editor.destroy()
    editor = createEditor('<p>hello helloworld worldhello hello</p>')
    editor.commands.setSearchTerm('hello')
    editor.commands.setWholeWord(true)

    expect(editor.storage.findAndReplace.results).toEqual([
      { from: 1, to: 6 },
      { from: 29, to: 34 },
    ])
  })

  it('finds Unicode whole words when wholeWord is enabled', () => {
    editor.destroy()
    editor = createEditor('<p>café caféine café</p>')
    editor.commands.setSearchTerm('café')
    editor.commands.setWholeWord(true)

    expect(editor.storage.findAndReplace.results).toEqual([
      { from: 1, to: 5 },
      { from: 14, to: 18 },
    ])
  })

  it('ignores wholeWord when regex mode is enabled', () => {
    editor.destroy()
    editor = createEditor('<p>hello helloworld worldhello hello</p>')
    editor.commands.setUseRegex(true)
    editor.commands.setSearchTerm('hello')
    editor.commands.setWholeWord(true)

    expect(editor.storage.findAndReplace.results).toHaveLength(4)
  })

  it('syncs wholeWord to the storage', () => {
    editor.commands.setWholeWord(true)

    expect(editor.storage.findAndReplace.wholeWord).toBe(true)
  })

  it('keeps the active result when a new match is inserted before it', () => {
    editor.commands.setSearchTerm('hello')
    editor.commands.goToNextResult()

    expect(editor.storage.findAndReplace.currentIndex).toBe(1)

    editor.commands.insertContentAt(7, 'hello ')

    expect(editor.storage.findAndReplace.results).toHaveLength(4)
    expect(editor.storage.findAndReplace.currentIndex).toBe(2)
    expect(editor.storage.findAndReplace.results[2]).toEqual({ from: 13, to: 18 })
  })

  it('keeps the active result when a new match is inserted after it', () => {
    editor.commands.setSearchTerm('hello')
    editor.commands.goToNextResult()

    expect(editor.storage.findAndReplace.currentIndex).toBe(1)

    editor.commands.insertContentAt(12, 'hello ')

    expect(editor.storage.findAndReplace.results).toHaveLength(4)
    expect(editor.storage.findAndReplace.currentIndex).toBe(1)
    expect(editor.storage.findAndReplace.results[1]).toEqual({ from: 7, to: 12 })
  })
})
