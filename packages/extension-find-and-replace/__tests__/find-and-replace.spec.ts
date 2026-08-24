import { Editor } from '@tiptap/core'
import Bold from '@tiptap/extension-bold'
import Document from '@tiptap/extension-document'
import FindAndReplace, {
  createSearchRegex,
  searchDocument,
} from '@tiptap/extension-find-and-replace'
import type { FindAndReplaceOptions } from '@tiptap/extension-find-and-replace'
import HardBreak from '@tiptap/extension-hard-break'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test'

import { normalizeCurrentIndex } from '../src/utils/normalizeCurrentIndex.js'

describe('FindAndReplace', () => {
  let editor: Editor

  const createEditor = (
    content: string,
    options: Partial<FindAndReplaceOptions> = { searchDebounceMs: 0 },
  ) => {
    const element = document.createElement('div')
    document.body.appendChild(element)

    return new Editor({
      element,
      extensions: [Document, Paragraph, Text, Bold, FindAndReplace.configure(options)],
      content,
    })
  }

  beforeEach(() => {
    editor = createEditor('<p>Hello hello HELLO</p>')
  })

  afterEach(() => {
    editor.destroy()
    vi.useRealTimers()
  })

  it('debounces setSearchTerm by default', () => {
    vi.useFakeTimers()

    editor.destroy()
    editor = createEditor('<p>Hello hello HELLO</p>', { searchDebounceMs: 250 })

    editor.commands.setSearchTerm('hel')
    editor.commands.setSearchTerm('hello')

    expect(editor.storage.findAndReplace.searchTerm).toBe('')
    expect(editor.storage.findAndReplace.results).toEqual([])

    vi.advanceTimersByTime(249)

    expect(editor.storage.findAndReplace.searchTerm).toBe('')
    expect(editor.storage.findAndReplace.results).toEqual([])

    vi.advanceTimersByTime(1)

    expect(editor.storage.findAndReplace.searchTerm).toBe('hello')
    expect(editor.storage.findAndReplace.results).toEqual([
      { from: 1, to: 6 },
      { from: 7, to: 12 },
      { from: 13, to: 18 },
    ])
  })

  it('flushes pending search before replace', () => {
    vi.useFakeTimers()

    editor.destroy()
    editor = createEditor('<p>foo bar foo</p>', { searchDebounceMs: 250 })

    editor.commands.setSearchTerm('foo')
    editor.commands.setReplaceTerm('baz')

    expect(editor.commands.replace()).toBe(true)
    expect(editor.getText()).toBe('baz bar foo')
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
        FindAndReplace.configure({ searchTerm: 'hello', searchDebounceMs: 0 }),
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
    expect(editor.commands.replaceAll()).toBe(false)
    expect(editor.getText()).toBe('Hello hello HELLO')
  })

  it('finds matches across marks', () => {
    editor.destroy()
    editor = createEditor('<p>he<strong>llo</strong> world</p>')
    editor.commands.setSearchTerm('hello')

    expect(editor.storage.findAndReplace.results).toEqual([{ from: 1, to: 6 }])
  })

  it('does not match across hard breaks', () => {
    editor.destroy()
    editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        HardBreak,
        FindAndReplace.configure({ searchDebounceMs: 0 }),
      ],
      content: '<p>foo<br>bar</p>',
    })
    editor.commands.setSearchTerm('foo\nbar')

    expect(editor.storage.findAndReplace.results).toEqual([])
  })

  it('finds results in a mark-heavy paragraph', () => {
    const segmentCount = 10_000
    const content = Array.from({ length: segmentCount }, (_, index) =>
      index % 2 === 0 ? '<strong>a</strong>' : 'a',
    ).join('')

    editor.destroy()
    editor = createEditor(`<p>${content}</p>`)

    const results = searchDocument(editor.state.doc, 'a', {
      caseSensitive: false,
      useRegex: false,
      wholeWord: false,
    })

    expect(results).toHaveLength(segmentCount)
    expect(results[0]).toEqual({ from: 1, to: 2 })
    expect(results.at(-1)).toEqual({ from: segmentCount, to: segmentCount + 1 })
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

    const currentResultPositions = () => {
      return Array.from(editor.view.dom.querySelectorAll('.find-and-replace-result-current')).map(
        element => editor.view.posAtDOM(element, 0),
      )
    }

    expect(editor.storage.findAndReplace.currentIndex).toBe(0)
    expect(currentResultPositions()).toEqual([1])

    editor.commands.goToNextResult()
    expect(editor.storage.findAndReplace.currentIndex).toBe(1)
    expect(editor.state.selection.from).toBe(9)
    expect(editor.state.selection.to).toBe(12)
    expect(currentResultPositions()).toEqual([9])

    editor.commands.goToNextResult()
    expect(currentResultPositions()).toEqual([17])

    editor.commands.goToNextResult()
    expect(editor.storage.findAndReplace.currentIndex).toBe(0)
    expect(currentResultPositions()).toEqual([1])

    editor.commands.goToPreviousResult()
    expect(editor.storage.findAndReplace.currentIndex).toBe(2)
    expect(currentResultPositions()).toEqual([17])
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

  it('expands capture groups per regex match when replacing all', () => {
    editor.destroy()
    editor = createEditor('<p>cat dog</p>')
    editor.commands.setUseRegex(true)
    editor.commands.setSearchTerm('(cat|dog)')
    editor.commands.setReplaceTerm('[$1]')
    editor.commands.replaceAll()

    expect(editor.getText()).toBe('[cat] [dog]')
  })

  it('reorders multiple regex capture groups', () => {
    editor.destroy()
    editor = createEditor('<p>alice@example bob@test</p>')
    editor.commands.setUseRegex(true)
    editor.commands.setSearchTerm('(\\w+)@(\\w+)')
    editor.commands.setReplaceTerm('$2:$1')
    editor.commands.replaceAll()

    expect(editor.getText()).toBe('example:alice test:bob')
  })

  it('expands whole-match and literal-dollar replacement tokens', () => {
    editor.destroy()
    editor = createEditor('<p>cat</p>')
    editor.commands.setUseRegex(true)
    editor.commands.setSearchTerm('(cat)')
    editor.commands.setReplaceTerm('$$[$&]')
    editor.commands.replaceAll()

    expect(editor.getText()).toBe('$[cat]')
  })

  it('inserts an empty string for unmatched optional groups', () => {
    editor.destroy()
    editor = createEditor('<p>a ab</p>')
    editor.commands.setUseRegex(true)
    editor.commands.setSearchTerm('(a)(b)?')
    editor.commands.setReplaceTerm('$2-$1')
    editor.commands.replaceAll()

    expect(editor.getText()).toBe('-a b-a')
  })

  it('deletes a single match when its replacement group is unmatched', () => {
    editor.destroy()
    editor = createEditor('<p>a a</p>')
    editor.commands.setUseRegex(true)
    editor.commands.setSearchTerm('(a)(b)?')
    editor.commands.setReplaceTerm('$2')
    editor.commands.replace()

    expect(editor.getText()).toBe(' a')
    expect(editor.storage.findAndReplace.results).toEqual([{ from: 2, to: 3 }])
    expect(editor.state.selection.from).toBe(2)
    expect(editor.state.selection.to).toBe(3)
  })

  it('keeps out-of-range capture references literal', () => {
    editor.destroy()
    editor = createEditor('<p>cat</p>')
    editor.commands.setUseRegex(true)
    editor.commands.setSearchTerm('(cat)')
    editor.commands.setReplaceTerm('$9')
    editor.commands.replaceAll()

    expect(editor.getText()).toBe('$9')
  })

  it('expands named and unmatched named capture groups', () => {
    editor.destroy()
    editor = createEditor('<p>cat cats</p>')
    editor.commands.setUseRegex(true)
    editor.commands.setSearchTerm('(?<word>cat)(?<suffix>s)?')
    editor.commands.setReplaceTerm('$<suffix>:$<word>')
    editor.commands.replaceAll()

    expect(editor.getText()).toBe(':cat s:cat')
  })

  it('keeps replacement tokens literal outside regex mode', () => {
    editor.destroy()
    editor = createEditor('<p>cat</p>')
    editor.commands.setSearchTerm('cat')
    editor.commands.setReplaceTerm('$$:$&:$1:$<word>')
    editor.commands.replaceAll()

    expect(editor.getText()).toBe('$$:$&:$1:$<word>')
  })

  it('uses the same capture expansion for replace and replaceAll', () => {
    editor.destroy()
    editor = createEditor('<p>cat</p>')
    editor.commands.setUseRegex(true)
    editor.commands.setSearchTerm('(cat)')
    editor.commands.setReplaceTerm('[$1]')
    editor.commands.replace()
    const singleReplacement = editor.getText()

    editor.destroy()
    editor = createEditor('<p>cat</p>')
    editor.commands.setUseRegex(true)
    editor.commands.setSearchTerm('(cat)')
    editor.commands.setReplaceTerm('[$1]')
    editor.commands.replaceAll()

    expect(singleReplacement).toBe('[cat]')
    expect(editor.getText()).toBe(singleReplacement)
  })

  it('skips an expanded replacement that still matches the regex', () => {
    editor.destroy()
    editor = createEditor('<p>foo foo</p>')
    editor.commands.setUseRegex(true)
    editor.commands.setSearchTerm('(foo)')
    editor.commands.setReplaceTerm('$1bar')
    editor.commands.replace()

    expect(editor.getText()).toBe('foobar foo')
    expect(editor.storage.findAndReplace.currentIndex).toBe(1)
    expect(editor.state.selection.from).toBe(8)
    expect(editor.state.selection.to).toBe(11)
  })

  it('advances past a Unicode capture after a single replacement', () => {
    editor.destroy()
    editor = createEditor('<p>😀 😀</p>')
    editor.commands.setUseRegex(true)
    editor.commands.setSearchTerm('(😀)')
    editor.commands.setReplaceTerm('[$1]')
    editor.commands.replace()

    expect(editor.getText()).toBe('[😀] 😀')
    expect(editor.storage.findAndReplace.currentIndex).toBe(1)
    // JavaScript and ProseMirror count UTF-16 code units, so the emoji spans two positions.
    expect(editor.state.selection.from).toBe(6)
    expect(editor.state.selection.to).toBe(8)
  })

  it('expands captures for regex matches split across marks', () => {
    editor.destroy()
    editor = createEditor('<p>he<strong>llo</strong> he<strong>llo</strong></p>')
    editor.commands.setUseRegex(true)
    editor.commands.setSearchTerm('(hello)')
    editor.commands.setReplaceTerm('[$1]')
    editor.commands.replaceAll()

    expect(editor.getText()).toBe('[hello] [hello]')
  })

  it('expands captures around non-text inline nodes', () => {
    editor.destroy()
    editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        HardBreak,
        FindAndReplace.configure({ searchDebounceMs: 0 }),
      ],
      content: '<p>cat<br>cat</p>',
    })
    editor.commands.setUseRegex(true)
    editor.commands.setSearchTerm('(cat)')
    editor.commands.setReplaceTerm('[$1]')
    editor.commands.replaceAll()

    expect(editor.getHTML()).toBe('<p>[cat]<br>[cat]</p>')
  })

  it('preserves boundary context when a regex match starts at a mark', () => {
    editor.destroy()
    editor = createEditor('<p>x<strong>foo</strong></p>')
    editor.commands.setUseRegex(true)
    editor.commands.setSearchTerm('(\\Bfoo)')
    editor.commands.setReplaceTerm('[$1]')
    editor.commands.replaceAll()

    expect(editor.getText()).toBe('x[foo]')
  })

  it('expands captures independently across textblocks', () => {
    editor.destroy()
    editor = createEditor('<p>cat</p><p>dog</p>')
    editor.commands.setUseRegex(true)
    editor.commands.setSearchTerm('(cat|dog)')
    editor.commands.setReplaceTerm('[$1]')
    editor.commands.replaceAll()

    expect(editor.getHTML()).toBe('<p>[cat]</p><p>[dog]</p>')
  })

  it('expands captures independently when textblocks share a node instance', () => {
    // ProseMirror nodes are immutable, so one instance may appear at multiple document positions.
    const textblock = editor.schema.node('paragraph', null, [editor.schema.text('cat')])

    editor.view.dispatch(
      editor.state.tr.replaceWith(0, editor.state.doc.content.size, [textblock, textblock]),
    )

    expect(editor.state.doc.child(0)).toBe(editor.state.doc.child(1))

    editor.commands.setUseRegex(true)
    editor.commands.setSearchTerm('(cat)')
    editor.commands.setReplaceTerm('[$1]')
    editor.commands.replaceAll()

    expect(editor.getHTML()).toBe('<p>[cat]</p><p>[cat]</p>')
  })

  it('matches String.prototype.replaceAll across supported regex replacements', () => {
    const cases = [
      {
        text: 'cat dog',
        source: '(cat|dog)',
        replacement: '[$1]',
      },
      {
        text: 'alice@example bob@test',
        source: '(\\w+)@(\\w+)',
        replacement: '$2:$1',
      },
      {
        text: 'a ab',
        source: '(a)(b)?',
        replacement: '$2-$1',
      },
      {
        text: 'cat cats',
        source: '(?<word>cat)(?<suffix>s)?',
        replacement: '$<suffix>:$<word>',
      },
      {
        text: 'cat dog',
        source: '(cat|dog)',
        replacement: '$$[$&]-$9',
      },
      {
        text: 'foo foo',
        source: '(^foo)',
        replacement: '[$1]',
      },
      {
        text: 'foo foo',
        source: '(foo$)',
        replacement: '[$1]',
      },
      {
        text: 'xfoo',
        source: '(\\Bfoo)',
        replacement: '[$1]',
      },
      {
        text: 'cat CAT',
        source: '(cat)',
        replacement: '<$1>',
      },
      {
        text: 'cat',
        source: '(cat)',
        replacement: '[$01]',
      },
      {
        text: '😀 😀',
        source: '(😀)',
        replacement: '[$1]',
      },
    ]

    editor.destroy()

    for (const { text, source, replacement } of cases) {
      editor = createEditor(`<p>${text}</p>`)
      editor.commands.setUseRegex(true)
      editor.commands.setSearchTerm(source)
      editor.commands.setReplaceTerm(replacement)
      editor.commands.replaceAll()

      expect(editor.getText(), `${source} with ${replacement}`).toBe(
        text.replaceAll(new RegExp(source, 'giu'), replacement),
      )

      editor.destroy()
    }
  })

  it('replaces results across textblocks without removing trailing text', () => {
    editor.destroy()
    editor = createEditor('<p>foo end</p><p>foo end</p>')
    editor.commands.setSearchTerm('foo')
    editor.commands.setReplaceTerm('long replacement')
    editor.commands.replaceAll()

    expect(editor.getHTML()).toBe('<p>long replacement end</p><p>long replacement end</p>')
  })

  it('replaces results across marks', () => {
    editor.destroy()
    editor = createEditor('<p>he<strong>llo</strong> he<strong>llo</strong></p>')
    editor.commands.setSearchTerm('hello')
    editor.commands.setReplaceTerm('world')
    editor.commands.replaceAll()

    expect(editor.getHTML()).toBe('<p>world world</p>')
  })

  it('replaces many results with one transaction step', () => {
    const resultCount = 20_000
    const content = Array.from({ length: resultCount }, () => 'foo').join(' ')
    const transactions: number[] = []

    editor.destroy()
    editor = createEditor(`<p>${content}</p>`)
    editor.commands.setSearchTerm('foo')
    editor.commands.setReplaceTerm('bar')
    editor.on('transaction', ({ transaction }) => {
      transactions.push(transaction.steps.length)
    })
    editor.commands.replaceAll()

    expect(editor.getText()).toBe(content.replaceAll('foo', 'bar'))
    expect(transactions).toEqual([1])
  }, 10_000)

  it('expands many regex captures in one transaction step', () => {
    const resultCount = 5_000
    const content = Array.from({ length: resultCount }, () => 'a').join(' ')
    const transactions: number[] = []

    editor.destroy()
    editor = createEditor(`<p>${content}</p>`)
    editor.commands.setUseRegex(true)
    editor.commands.setSearchTerm('(a)')
    editor.commands.setReplaceTerm('[$1]')
    editor.on('transaction', ({ transaction }) => {
      transactions.push(transaction.steps.length)
    })
    editor.commands.replaceAll()

    expect(editor.getText()).toBe(content.replaceAll(/(a)/gu, '[$1]'))
    expect(transactions).toEqual([1])
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

  it('finds only whole words when regex mode is enabled', () => {
    editor.destroy()
    editor = createEditor('<p>hello helloworld worldhello hello</p>')
    editor.commands.setUseRegex(true)
    editor.commands.setSearchTerm('hello')
    editor.commands.setWholeWord(true)

    expect(editor.storage.findAndReplace.results).toEqual([
      { from: 1, to: 6 },
      { from: 29, to: 34 },
    ])
  })

  it('finds Unicode whole words when regex mode is enabled', () => {
    editor.destroy()
    editor = createEditor('<p>café caféine café</p>')
    editor.commands.setUseRegex(true)
    editor.commands.setSearchTerm('café')
    editor.commands.setWholeWord(true)

    expect(editor.storage.findAndReplace.results).toEqual([
      { from: 1, to: 5 },
      { from: 14, to: 18 },
    ])
  })

  it('rejects regex matches next to Unicode letters stored as surrogate pairs', () => {
    // U+10400 is above 0xffff, so JavaScript stores this Deseret letter in two UTF-16 code units.
    const deseretLetter = '𐐀'

    editor.destroy()
    editor = createEditor(`<p>${deseretLetter}cat cat${deseretLetter} cat</p>`)
    editor.commands.setUseRegex(true)
    editor.commands.setSearchTerm('cat')
    editor.commands.setWholeWord(true)

    expect(editor.storage.findAndReplace.results).toEqual([{ from: 13, to: 16 }])
  })

  it('tries later regex alternatives when the first one is not a whole word', () => {
    editor.destroy()
    editor = createEditor('<p>catalog cat cats</p>')
    editor.commands.setUseRegex(true)
    editor.commands.setSearchTerm('cat|catalog')
    editor.commands.setWholeWord(true)

    expect(editor.storage.findAndReplace.results).toEqual([
      { from: 1, to: 8 },
      { from: 9, to: 12 },
    ])
  })

  it('tries longer regex alternatives when a boundary requires them', () => {
    editor.destroy()
    editor = createEditor('<p>cat cats</p>')
    editor.commands.setUseRegex(true)
    editor.commands.setSearchTerm('cat|cats')
    editor.commands.setWholeWord(true)

    expect(editor.storage.findAndReplace.results).toEqual([
      { from: 1, to: 4 },
      { from: 5, to: 9 },
    ])
  })

  it('reuses shared punctuation boundaries between consecutive matches', () => {
    editor.destroy()
    editor = createEditor('<p>cat-cat.cat</p>')
    editor.commands.setUseRegex(true)
    editor.commands.setSearchTerm('cat')
    editor.commands.setWholeWord(true)

    expect(editor.storage.findAndReplace.results).toEqual([
      { from: 1, to: 4 },
      { from: 5, to: 8 },
      { from: 9, to: 12 },
    ])
  })

  it('preserves inline regex flags when whole-word mode wraps the pattern', () => {
    editor.destroy()
    editor = createEditor('<p>Catalog CAT cats</p>')
    editor.commands.setCaseSensitive(true)
    editor.commands.setUseRegex(true)
    editor.commands.setSearchTerm('(?i)cat|catalog')
    editor.commands.setWholeWord(true)

    expect(editor.storage.findAndReplace.results).toEqual([
      { from: 1, to: 8 },
      { from: 9, to: 12 },
    ])
  })

  it('backtracks quantified whitespace to preserve whole-word matches', () => {
    editor.destroy()
    editor = createEditor('<p>(cat) #cat cat! cat.cat cat-cat</p>')
    editor.commands.setUseRegex(true)
    editor.commands.setSearchTerm('\\s*cat\\s*')
    editor.commands.setWholeWord(true)

    expect(editor.storage.findAndReplace.results).toEqual([
      { from: 2, to: 5 },
      { from: 8, to: 11 },
      { from: 12, to: 15 },
      { from: 16, to: 20 },
      { from: 21, to: 24 },
      { from: 25, to: 28 },
      { from: 29, to: 32 },
    ])
  })

  it('preserves numeric captures when replacing boundary-constrained alternatives', () => {
    editor.destroy()
    editor = createEditor('<p>catalog cat cats</p>')
    editor.commands.setUseRegex(true)
    editor.commands.setSearchTerm('(cat|catalog)')
    editor.commands.setWholeWord(true)
    editor.commands.setReplaceTerm('[$1]')
    editor.commands.replaceAll()

    expect(editor.getText()).toBe('[catalog] [cat] cats')
  })

  it('preserves captures when replacing one boundary-constrained result', () => {
    editor.destroy()
    editor = createEditor('<p>catalog cat cats</p>')
    editor.commands.setUseRegex(true)
    editor.commands.setSearchTerm('(cat|catalog)')
    editor.commands.setWholeWord(true)
    editor.commands.setReplaceTerm('[$1]-$&')
    editor.commands.replace()

    expect(editor.getText()).toBe('[catalog]-catalog cat cats')
  })

  it('preserves named captures when replacing boundary-constrained alternatives', () => {
    editor.destroy()
    editor = createEditor('<p>catalog cat cats</p>')
    editor.commands.setUseRegex(true)
    editor.commands.setSearchTerm('(?P<word>cat|catalog)')
    editor.commands.setWholeWord(true)
    editor.commands.setReplaceTerm('[$<word>]-$&')
    editor.commands.replaceAll()

    expect(editor.getText()).toBe('[catalog]-catalog [cat]-cat cats')
  })

  it('finds Unicode alternatives that satisfy whole-word boundaries', () => {
    editor.destroy()
    editor = createEditor('<p>caféine café</p>')
    editor.commands.setUseRegex(true)
    editor.commands.setSearchTerm('café|caféine')
    editor.commands.setWholeWord(true)

    expect(editor.storage.findAndReplace.results).toEqual([
      { from: 1, to: 8 },
      { from: 9, to: 13 },
    ])
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

  it('normalizes search result indices', () => {
    expect(normalizeCurrentIndex(undefined, 1)).toBeNull()
    expect(normalizeCurrentIndex(null, 1)).toBeNull()
    expect(normalizeCurrentIndex(0, 0)).toBeNull()
    expect(normalizeCurrentIndex(-1, 2)).toBe(0)
    expect(normalizeCurrentIndex(2, 2)).toBe(1)
  })
})
