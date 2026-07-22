import { useEditorState } from '@tiptap/react'
import { useEffect, useRef, useState } from 'react'

const searchDebounceDelay = 250

export function useFindAndReplace(editor) {
  const { searchTerm, replaceTerm, caseSensitive, useRegex, wholeWord, resultCount, currentIndex } =
    useEditorState({
      editor,
      selector: ctx => ({
        searchTerm: ctx.editor.storage.findAndReplace.searchTerm,
        replaceTerm: ctx.editor.storage.findAndReplace.replaceTerm,
        caseSensitive: ctx.editor.storage.findAndReplace.caseSensitive,
        useRegex: ctx.editor.storage.findAndReplace.useRegex,
        wholeWord: ctx.editor.storage.findAndReplace.wholeWord,
        resultCount: ctx.editor.storage.findAndReplace.results.length,
        currentIndex: ctx.editor.storage.findAndReplace.currentIndex,
      }),
    })
  const searchTimeout = useRef(null)
  const [searchInput, setSearchInput] = useState(searchTerm)

  useEffect(() => {
    if (searchTimeout.current === null) {
      setSearchInput(searchTerm)
    }
  }, [searchTerm])

  useEffect(() => {
    return () => clearTimeout(searchTimeout.current)
  }, [])

  const clearSearchTimeout = () => {
    clearTimeout(searchTimeout.current)
    searchTimeout.current = null
  }

  const setSearchTerm = term => {
    setSearchInput(term)
    clearSearchTimeout()
    searchTimeout.current = setTimeout(() => {
      searchTimeout.current = null
      editor.commands.setSearchTerm(term)
    }, searchDebounceDelay)
  }

  const flushSearchTerm = term => {
    clearSearchTimeout()

    if (term !== searchTerm) {
      editor.commands.setSearchTerm(term)
    }
  }

  const goToNextResult = () => {
    flushSearchTerm(searchInput)
    editor.commands.goToNextResult()
  }

  const goToPreviousResult = () => {
    flushSearchTerm(searchInput)
    editor.commands.goToPreviousResult()
  }

  const replace = () => {
    flushSearchTerm(searchInput)
    editor.commands.replace()
  }

  const replaceAll = () => {
    flushSearchTerm(searchInput)
    editor.commands.replaceAll()
  }

  const clearSearch = () => {
    clearSearchTimeout()
    setSearchInput('')
    editor.commands.clearSearch()
  }

  const onSearchKeyDown = event => {
    if (event.key !== 'Enter') {
      return
    }

    flushSearchTerm(event.currentTarget.value)

    if (event.shiftKey) {
      editor.commands.goToPreviousResult()
    } else {
      editor.commands.goToNextResult()
    }
  }

  return {
    searchInput,
    replaceTerm,
    caseSensitive,
    useRegex,
    wholeWord,
    resultCount,
    currentIndex,
    setSearchTerm,
    setReplaceTerm: term => editor.commands.setReplaceTerm(term),
    setCaseSensitive: value => editor.commands.setCaseSensitive(value),
    setUseRegex: value => editor.commands.setUseRegex(value),
    setWholeWord: value => editor.commands.setWholeWord(value),
    goToNextResult,
    goToPreviousResult,
    replace,
    replaceAll,
    clearSearch,
    onSearchKeyDown,
  }
}
