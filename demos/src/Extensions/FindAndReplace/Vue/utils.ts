import type { Editor } from '@tiptap/vue-3'
import type { FindAndReplaceStorage } from '@tiptap/extension-find-and-replace'
import { computed, ref } from 'vue'

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

  const updateFindAndReplace = () => {
    if (editor) {
      findAndReplace.value = { ...editor.storage.findAndReplace }
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
      editor = null
    },
    setSearchTerm(term: string) {
      findAndReplace.value.searchTerm = term
      editor?.commands.setSearchTerm(term)
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
      editor?.commands.goToNextResult()
    },
    goToPreviousResult() {
      editor?.commands.goToPreviousResult()
    },
    replace() {
      editor?.commands.replace()
    },
    replaceAll() {
      editor?.commands.replaceAll()
    },
    clearSearch() {
      editor?.commands.clearSearch()
    },
  }
}
