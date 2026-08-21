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
    Tiptap is a headless rich text editor that gives you full control over your editing experience. Built on ProseMirror, it provides a flexible framework for building custom editors without being tied to a specific UI. You can use it with React, Vue, or vanilla JavaScript.
  </p>
  <p>
    One of the best things about Tiptap is its extension system. You can add features like bold, italic, lists, or even custom nodes with just a few lines of code. The editor stays lightweight because you only include what you need. Each extension adds specific functionality to your editor.
  </p>
  <p>
    The community around Tiptap is growing fast. Developers love how easy it is to create collaborative editing experiences. Whether you are building a blog, a documentation site, or a complex content management system, Tiptap has the tools you need. The editor handles everything from simple text formatting to complex document structures.
  </p>
  <p>
    When you need to find and replace text in your document, Tiptap makes it simple. You can search for words, use regular expressions to find patterns, or even use capture groups to replace parts of matches. Try searching for "editor" to see how many times it appears, or use regex to find variations like "color" and "colour" at the same time.
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
