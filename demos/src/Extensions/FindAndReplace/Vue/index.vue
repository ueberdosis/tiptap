<template>
  <div v-if="editor">
    <div class="control-group">
      <div class="button-group">
        <input
          type="text"
          placeholder="Search"
          aria-label="Search"
          :value="findAndReplace.searchTerm"
          @input="setSearchTerm($event.target.value)"
          @keydown.enter.exact="goToNextResult"
          @keydown.shift.enter="goToPreviousResult"
          data-testid="search-input"
        />
        <input
          type="text"
          placeholder="Replace"
          aria-label="Replace"
          :value="findAndReplace.replaceTerm"
          @input="setReplaceTerm($event.target.value)"
          data-testid="replace-input"
        />
        <label>
          <input
            type="checkbox"
            :checked="findAndReplace.caseSensitive"
            @change="setCaseSensitive($event.target.checked)"
            data-testid="case-sensitive-checkbox"
          />
          Match case
        </label>
        <label>
          <input
            type="checkbox"
            :checked="findAndReplace.wholeWord"
            :disabled="findAndReplace.useRegex"
            @change="setWholeWord($event.target.checked)"
            data-testid="whole-word-checkbox"
          />
          Whole word
        </label>
        <label>
          <input
            type="checkbox"
            :checked="findAndReplace.useRegex"
            @change="setUseRegex($event.target.checked)"
            data-testid="regex-checkbox"
          />
          Regex
        </label>
      </div>
      <div class="button-group">
        <button
          @click="goToPreviousResult"
          :disabled="findAndReplace.results.length === 0"
          data-testid="previous-button"
        >
          Previous
        </button>
        <button
          @click="goToNextResult"
          :disabled="findAndReplace.results.length === 0"
          data-testid="next-button"
        >
          Next
        </button>
        <button
          @click="replace"
          :disabled="findAndReplace.results.length === 0"
          data-testid="replace-button"
        >
          Replace
        </button>
        <button
          @click="replaceAll"
          :disabled="findAndReplace.results.length === 0"
          data-testid="replace-all-button"
        >
          Replace all
        </button>
        <button @click="clearSearch" data-testid="clear-button">Clear</button>
        <span class="result-count" data-testid="result-count">
          {{ resultCount }}
        </span>
      </div>
    </div>
    <editor-content :editor="editor" />
  </div>
</template>

<script setup lang="ts">
import Document from '@tiptap/extension-document'
import FindAndReplace from '@tiptap/extension-find-and-replace'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { Editor, EditorContent } from '@tiptap/vue-3'
import { onBeforeUnmount, onMounted, shallowRef } from 'vue'

import { useFindAndReplace } from './utils.js'

const editor = shallowRef<Editor | null>(null)
const {
  findAndReplace,
  resultCount,
  connect,
  disconnect,
  setSearchTerm,
  setReplaceTerm,
  setCaseSensitive,
  setUseRegex,
  setWholeWord,
  goToNextResult,
  goToPreviousResult,
  replace,
  replaceAll,
  clearSearch,
} = useFindAndReplace()

const content = `
  <p>
    Find and replace is one of those features you only miss once it is gone.
    Try searching for "tiptap" in this text. Tiptap highlights every match
    right inside the editor, no matter if it is written as tiptap, Tiptap
    or even TIPTAP.
  </p>
  <p>
    Toggle "Match case" to only find exact matches. Enable "Regex" and search
    for colou?r to find both color and colour at once. Hit "Replace" to swap
    the current match and jump straight to the next one.
  </p>
`

onMounted(() => {
  const nextEditor = new Editor({
    extensions: [Document, Paragraph, Text, FindAndReplace],
    content,
  })

  editor.value = nextEditor
  connect(nextEditor)
})

onBeforeUnmount(() => {
  disconnect()
  editor.value?.destroy()
})
</script>

<style lang="scss">
/* Basic editor styles */
.tiptap {
  :first-child {
    margin-top: 0;
  }
}

.control-group {
  label {
    align-items: center;
    display: flex;
    gap: 0.25rem;
    font-size: 0.875rem;
  }

  .result-count {
    align-self: center;
    color: var(--gray-5);
    font-size: 0.875rem;
  }
}
</style>
