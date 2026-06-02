<template>
  <div>
    <div class="control-group">
      <div class="button-group">
        <button class="open-search" @click="isPanelOpen = !isPanelOpen">
          {{ isPanelOpen ? 'Hide Search' : 'Show Search' }}
        </button>
      </div>
    </div>

    <div v-if="isPanelOpen" class="search-panel" role="dialog" aria-label="Search and replace">
      <label class="field">
        <span>Search</span>
        <input
          ref="searchInputRef"
          class="search-input"
          placeholder="Search"
          :value="searchTerm"
          @input="handleSearchChange(($event.target as HTMLInputElement).value)"
          @keydown="handleSearchKeydown"
        />
      </label>

      <label class="field">
        <span>Replace</span>
        <input
          class="replace-input"
          placeholder="Replace"
          :value="replaceTerm"
          @input="handleReplaceChange(($event.target as HTMLInputElement).value)"
          @keydown="handleReplaceKeydown"
        />
      </label>

      <label class="case-sensitive">
        <input
          type="checkbox"
          :checked="caseSensitive"
          @change="handleCaseToggle(($event.target as HTMLInputElement).checked)"
        />
        Case sensitive
      </label>

      <div class="controls">
        <span class="result-count">{{ label }}</span>
        <div class="button-group">
          <button type="button" @click="handlePrev" title="Previous" :disabled="disabled">←</button>
          <button type="button" @click="handleNext" title="Next" :disabled="disabled">→</button>
        </div>
        <div class="button-group">
          <button type="button" @click="handleReplace" title="Replace" :disabled="disabled">Replace</button>
          <button type="button" @click="handleReplaceAll" title="Replace all" :disabled="disabled">Replace All</button>
        </div>
      </div>

      <button class="close-panel" @click="handleClosePanel" title="Close search">×</button>
    </div>

    <div class="editor-wrapper">
      <editor-content :editor="editor" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { SearchAndReplace } from '@tiptap/extension-search-and-replace'
import StarterKit from '@tiptap/starter-kit'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const isPanelOpen = ref(false)
const searchTerm = ref('')
const replaceTerm = ref('')
const resultsCount = ref(0)
const currentIndex = ref(0)
const caseSensitive = ref(false)
const searchInputRef = ref<HTMLInputElement | null>(null)

const disabled = computed(() => resultsCount.value === 0)
const label = computed(() =>
  resultsCount.value === 0 ? 'No results' : `${currentIndex.value + 1} / ${resultsCount.value}`,
)

const editor = useEditor({
  extensions: [StarterKit, SearchAndReplace],
  content: `
    <p>
      This is a small demo for the Search & Replace extension. Try searching for words like <strong>demo</strong>, <em>Search</em> or <u>replace</u>.
    </p>
    <p>
      Use <strong>Mod+F</strong> to open the search box.
    </p>
  `,
})

const syncFromStorage = () => {
  if (!editor.value) {
    return
  }
  const storage = editor.value.storage.searchAndReplace
  if (!storage) {
    return
  }
  resultsCount.value = storage.results.length
  currentIndex.value = storage.results.length ? storage.resultIndex : 0
  caseSensitive.value = storage.caseSensitive
}

const handleSearchChange = (value: string) => {
  searchTerm.value = value
  editor.value?.commands.setSearchTerm(value)
}

const handleReplaceChange = (value: string) => {
  replaceTerm.value = value
}

const handlePrev = () => {
  editor.value?.chain().previousSearchResult().run()
}

const handleNext = () => {
  editor.value?.chain().nextSearchResult().run()
}

const handleReplace = () => {
  editor.value?.chain().replace(replaceTerm.value).run()
}

const handleReplaceAll = () => {
  editor.value?.chain().replaceAll(replaceTerm.value).run()
}

const handleCaseToggle = (value: boolean) => {
  caseSensitive.value = value
  editor.value?.commands.setCaseSensitive(value)
  if (searchTerm.value) {
    editor.value?.commands.setSearchTerm(searchTerm.value)
  }
}

const handleClosePanel = () => {
  isPanelOpen.value = false
}

const handleSearchKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    event.preventDefault()
    handleNext()
  }
}

const handleReplaceKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    event.preventDefault()
    handleReplace()
  }
}

watch(
  editor,
  newEditor => {
    if (!newEditor) {
      return
    }

    const handleTransaction = () => syncFromStorage()
    newEditor.on('transaction', handleTransaction)
    syncFromStorage()

    onBeforeUnmount(() => {
      newEditor.off('transaction', handleTransaction)
    })
  },
  { immediate: true },
)

const onKey = (event: KeyboardEvent) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'f') {
    event.preventDefault()
    isPanelOpen.value = true
    window.requestAnimationFrame(() => searchInputRef.value?.select())
  }

  if (event.key === 'Escape' && isPanelOpen.value) {
    isPanelOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKey)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
})

watch(isPanelOpen, isOpen => {
  if (!isOpen) {
    return
  }
  const id = window.setTimeout(() => searchInputRef.value?.focus(), 50)
  onBeforeUnmount(() => window.clearTimeout(id))
})
</script>

<style scoped lang="scss">
/* Basic editor styles */
.tiptap {
  :first-child {
    margin-top: 0;
  }
}

.search-and-replace-demo {
  position: relative;
  width: 100%;
}

.demo-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  gap: 0.5rem;
}

.toolbar-results {
  font-size: 0.875rem;
  color: var(--gray-5);
}

.search-panel {
  position: absolute;
  top: 0.5rem;
  right: 0;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: var(--white);
  border: 1px solid var(--gray-3);
  border-radius: 0.5rem;
  box-shadow: var(--shadow);
  z-index: 100;
}

.panel-header {
  display: none;
}

.close-panel {
  padding: 0.25rem 0.375rem;
  border: none;
  background: transparent;
  font-size: 1rem;
  cursor: pointer;
  color: var(--gray-5);
  border-radius: 0.3rem;

  &:hover {
    background: var(--gray-2);
  }
}

.field {
  display: flex;
  align-items: center;
  gap: 0.25rem;

  span {
    display: none;
  }
}

.search-input,
.replace-input {
  min-width: 120px;
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--gray-3);
  border-radius: 0.3rem;
  background: var(--white);
  font-size: 0.8125rem;
}

.case-sensitive {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  color: var(--gray-5);
  padding: 0 0.25rem;
  white-space: nowrap;
}

.controls {
  display: flex;
  gap: 0.125rem;
  align-items: center;
}

.button-group {
  display: flex;
  gap: 0.125rem;
}

.button-group button,
.controls button {
  padding: 0.25rem 0.375rem;
  border-radius: 0.3rem;
  font-size: 0.75rem;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.4;
  }
}

.result-count {
  font-size: 0.75rem;
  color: var(--gray-5);
  padding: 0 0.25rem;
  white-space: nowrap;
}

.editor-wrapper {
  width: 100%;
  min-height: 400px;
}

:deep(.search-result) {
  background-color: var(--purple-light);
  border-radius: 2px;
}

:deep(.search-result-current) {
  background-color: var(--purple-light);
  outline: 2px solid var(--purple);
  border-radius: 3px;
}
</style>
