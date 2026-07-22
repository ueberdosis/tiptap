import type { Command } from '@tiptap/core'
import { Extension } from '@tiptap/core'
import type { EditorState, Transaction } from '@tiptap/pm/state'
import { TextSelection } from '@tiptap/pm/state'

import type { FindAndReplaceMeta, FindAndReplacePluginState } from './plugin.js'
import { FindAndReplacePlugin, FindAndReplacePluginKey } from './plugin.js'
import { findNextIndex, searchDocument } from './search.js'
import type { SearchResult } from './search.js'
import type { FindAndReplaceOptions, FindAndReplaceStorage } from './types.js'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    findAndReplace: {
      /**
       * Set the search term and highlight all matches in the document.
       * @param term The search term, treated as regex source when regex mode is enabled.
       * @example editor.commands.setSearchTerm('Hello')
       */
      setSearchTerm: (term: string) => ReturnType

      /**
       * Set the replace term used by the replace commands.
       * @param term The replacement text.
       * @example editor.commands.setReplaceTerm('World')
       */
      setReplaceTerm: (term: string) => ReturnType

      /**
       * Set whether the search is case sensitive.
       * @param caseSensitive The new case sensitivity.
       * @example editor.commands.setCaseSensitive(true)
       */
      setCaseSensitive: (caseSensitive: boolean) => ReturnType

      /**
       * Set whether the search term is treated as an RE2-compatible regular expression.
       * Lookarounds and backreferences are not supported.
       * @param useRegex The new regex mode.
       * @example editor.commands.setUseRegex(true)
       */
      setUseRegex: (useRegex: boolean) => ReturnType

      /**
       * Set whether to match whole words only. Ignored when regex mode is enabled.
       * @param wholeWord The new whole word mode.
       * @example editor.commands.setWholeWord(true)
       */
      setWholeWord: (wholeWord: boolean) => ReturnType

      /**
       * Replace the current search result and jump to the next one.
       * @example editor.commands.replace()
       */
      replace: () => ReturnType

      /**
       * Replace all search results at once.
       * @example editor.commands.replaceAll()
       */
      replaceAll: () => ReturnType

      /**
       * Jump to the next search result, wrapping around at the end.
       * @example editor.commands.goToNextResult()
       */
      goToNextResult: () => ReturnType

      /**
       * Jump to the previous search result, wrapping around at the start.
       * @example editor.commands.goToPreviousResult()
       */
      goToPreviousResult: () => ReturnType

      /**
       * Clear the search term and remove all search result highlights.
       * @example editor.commands.clearSearch()
       */
      clearSearch: () => ReturnType
    }
  }
}

function mergePluginMeta(tr: Transaction, meta: FindAndReplaceMeta): void {
  const currentMeta = tr.getMeta(FindAndReplacePluginKey) as FindAndReplaceMeta | undefined

  tr.setMeta(FindAndReplacePluginKey, { ...currentMeta, ...meta })
}

function setPluginMeta(meta: FindAndReplaceMeta): Command {
  return ({ tr, dispatch }) => {
    if (dispatch) {
      mergePluginMeta(tr, meta)
    }

    return true
  }
}

function getPluginState(state: EditorState): FindAndReplacePluginState | null {
  const pluginState = FindAndReplacePluginKey.getState(state)

  if (!pluginState || pluginState.results.length === 0) {
    return null
  }

  return pluginState
}

function currentResult(pluginState: FindAndReplacePluginState): SearchResult | undefined {
  return pluginState.results[pluginState.currentIndex ?? 0]
}

function shiftIndex(currentIndex: number | null, length: number, direction: 1 | -1): number {
  if (currentIndex === null) {
    return direction === 1 ? 0 : length - 1
  }

  return (currentIndex + direction + length) % length
}

function selectResult(tr: Transaction, result: SearchResult, index: number): void {
  tr.setSelection(TextSelection.create(tr.doc, result.from, result.to))
  mergePluginMeta(tr, { currentIndex: index })
  tr.scrollIntoView()
}

function replaceResult(
  tr: Transaction,
  pluginState: FindAndReplacePluginState,
  result: SearchResult,
): void {
  const { searchTerm, replaceTerm, caseSensitive, useRegex, wholeWord } = pluginState

  tr.insertText(replaceTerm, result.from, result.to)

  // Jump to the first result behind the inserted text, so a replacement
  // that still matches the search (e.g. "foo" -> "foobar") is skipped.
  const results = searchDocument(tr.doc, searchTerm, { caseSensitive, useRegex, wholeWord })
  const nextIndex = findNextIndex(results, result.from + replaceTerm.length)

  if (nextIndex === null) {
    mergePluginMeta(tr, { currentIndex: null })
    return
  }

  selectResult(tr, results[nextIndex], nextIndex)
}

export const FindAndReplace = Extension.create<FindAndReplaceOptions, FindAndReplaceStorage>({
  name: 'findAndReplace',

  addOptions() {
    return {
      searchTerm: '',
      replaceTerm: '',
      caseSensitive: false,
      useRegex: false,
      wholeWord: false,
      injectCSS: true,
      injectNonce: undefined,
    }
  },

  addStorage() {
    return {
      searchTerm: this.options.searchTerm,
      replaceTerm: this.options.replaceTerm,
      caseSensitive: this.options.caseSensitive,
      useRegex: this.options.useRegex,
      wholeWord: this.options.wholeWord,
      results: [],
      currentIndex: null,
    }
  },

  addProseMirrorPlugins() {
    return [
      FindAndReplacePlugin(this.options, pluginState => {
        this.storage.results = pluginState.results
        this.storage.currentIndex = pluginState.currentIndex
      }),
    ]
  },

  onTransaction() {
    const pluginState = FindAndReplacePluginKey.getState(this.editor.state)

    if (!pluginState) {
      return
    }

    this.storage.searchTerm = pluginState.searchTerm
    this.storage.replaceTerm = pluginState.replaceTerm
    this.storage.caseSensitive = pluginState.caseSensitive
    this.storage.useRegex = pluginState.useRegex
    this.storage.wholeWord = pluginState.wholeWord
    this.storage.results = pluginState.results
    this.storage.currentIndex = pluginState.currentIndex
  },

  addCommands() {
    return {
      setSearchTerm: term => setPluginMeta({ searchTerm: term }),
      setReplaceTerm: term => setPluginMeta({ replaceTerm: term }),
      setCaseSensitive: caseSensitive => setPluginMeta({ caseSensitive }),
      setUseRegex: useRegex => setPluginMeta({ useRegex }),
      setWholeWord: wholeWord => setPluginMeta({ wholeWord }),
      clearSearch: () => setPluginMeta({ searchTerm: '' }),

      replace:
        () =>
        ({ tr, state, dispatch }) => {
          const pluginState = getPluginState(state)

          if (!pluginState) {
            return false
          }

          const result = currentResult(pluginState)

          if (!result) {
            return false
          }

          if (dispatch) {
            replaceResult(tr, pluginState, result)
          }

          return true
        },

      replaceAll:
        () =>
        ({ tr, state, dispatch }) => {
          const pluginState = getPluginState(state)

          if (!pluginState) {
            return false
          }

          if (dispatch) {
            // Replace from the end of the document, so earlier results
            // keep their positions while later ones are replaced.
            const results = [...pluginState.results].reverse()

            results.forEach(result => {
              tr.insertText(pluginState.replaceTerm, result.from, result.to)
            })
          }

          return true
        },

      goToNextResult:
        () =>
        ({ tr, state, dispatch }) => {
          const pluginState = getPluginState(state)

          if (!pluginState) {
            return false
          }

          const nextIndex = shiftIndex(pluginState.currentIndex, pluginState.results.length, 1)

          if (dispatch) {
            selectResult(tr, pluginState.results[nextIndex], nextIndex)
          }

          return true
        },

      goToPreviousResult:
        () =>
        ({ tr, state, dispatch }) => {
          const pluginState = getPluginState(state)

          if (!pluginState) {
            return false
          }

          const previousIndex = shiftIndex(pluginState.currentIndex, pluginState.results.length, -1)

          if (dispatch) {
            selectResult(tr, pluginState.results[previousIndex], previousIndex)
          }

          return true
        },
    }
  },
})

export default FindAndReplace
