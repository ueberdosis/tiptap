import type { Editor } from '@tiptap/vue-3'
import type { FindAndReplaceStorage } from '@tiptap/extension-find-and-replace'
import { computed, ref } from 'vue'

const searchDebounceDelay = 250

function createFindAndReplaceState(): FindAndReplaceStorage {
  return {
    searchTerm: '',
    replaceTerm: '',
    caseSensitive: false,
    useRegex: false,
    wholeWord: false,
    results: [],
    currentIndex: null,
  }
}

export function useFindAndReplace() {
  const findAndReplace = ref<FindAndReplaceStorage>(createFindAndReplaceState())
  const resultCount = computed(() => {
    const { results, currentIndex } = findAndReplace.value

    return results.length === 0 ? 'No results' : `${(currentIndex ?? 0) + 1} of ${results.length}`
  })
  let editor: Editor | null = null
  let searchTimeout: ReturnType<typeof setTimeout> | null = null

  const updateFindAndReplace = () => {
    if (editor) {
      findAndReplace.value = { ...editor.storage.findAndReplace }
    }
  }

  const clearSearchTimeout = () => {
    if (searchTimeout !== null) {
      clearTimeout(searchTimeout)
      searchTimeout = null
    }
  }

  const flushSearchTerm = () => {
    clearSearchTimeout()

    if (editor && findAndReplace.value.searchTerm !== editor.storage.findAndReplace.searchTerm) {
      editor.commands.setSearchTerm(findAndReplace.value.searchTerm)
    }
  }

  return {
    findAndReplace,
    resultCount,
    connect(nextEditor: Editor) {
      editor = nextEditor
      updateFindAndReplace()
      editor.on('transaction', updateFindAndReplace)
    },
    disconnect() {
      editor?.off('transaction', updateFindAndReplace)
      clearSearchTimeout()
      editor = null
    },
    setSearchTerm(term: string) {
      findAndReplace.value.searchTerm = term
      clearSearchTimeout()
      searchTimeout = setTimeout(() => editor?.commands.setSearchTerm(term), searchDebounceDelay)
    },
    setReplaceTerm(term: string) {
      editor?.commands.setReplaceTerm(term)
    },
    setCaseSensitive(value: boolean) {
      editor?.commands.setCaseSensitive(value)
    },
    setUseRegex(value: boolean) {
      editor?.commands.setUseRegex(value)
    },
    setWholeWord(value: boolean) {
      editor?.commands.setWholeWord(value)
    },
    goToNextResult() {
      flushSearchTerm()
      editor?.commands.goToNextResult()
    },
    goToPreviousResult() {
      flushSearchTerm()
      editor?.commands.goToPreviousResult()
    },
    replace() {
      flushSearchTerm()
      editor?.commands.replace()
    },
    replaceAll() {
      flushSearchTerm()
      editor?.commands.replaceAll()
    },
    clearSearch() {
      clearSearchTimeout()
      editor?.commands.clearSearch()
    },
  }
}
