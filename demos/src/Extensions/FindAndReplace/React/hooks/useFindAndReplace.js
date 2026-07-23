import { useEditorState } from '@tiptap/react'
import { useEffect, useState } from 'react'

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
  const [searchInput, setSearchInput] = useState(searchTerm)

  useEffect(() => {
    setSearchInput(searchTerm)
  }, [searchTerm])

  const setSearchTerm = term => {
    setSearchInput(term)
    editor.commands.setSearchTerm(term)
  }

  const goToNextResult = () => {
    editor.commands.goToNextResult()
  }

  const goToPreviousResult = () => {
    editor.commands.goToPreviousResult()
  }

  const replace = () => {
    editor.commands.replace()
  }

  const replaceAll = () => {
    editor.commands.replaceAll()
  }

  const clearSearch = () => {
    setSearchInput('')
    editor.commands.clearSearch()
  }

  const onSearchKeyDown = event => {
    if (event.key !== 'Enter') {
      return
    }

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
