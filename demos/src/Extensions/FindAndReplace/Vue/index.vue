<template>
  <div v-if="editor">
    <div class="control-group">
      <div class="button-group">
        <input
          type="text"
          placeholder="Search"
          aria-label="Search"
          :value="editor.storage.findAndReplace.searchTerm"
          @input="event => editor.commands.setSearchTerm(event.target.value)"
          @keydown.enter.exact="editor.commands.goToNextResult()"
          @keydown.shift.enter="editor.commands.goToPreviousResult()"
          data-testid="search-input"
        />
        <input
          type="text"
          placeholder="Replace"
          aria-label="Replace"
          :value="editor.storage.findAndReplace.replaceTerm"
          @input="event => editor.commands.setReplaceTerm(event.target.value)"
          data-testid="replace-input"
        />
        <label>
          <input
            type="checkbox"
            :checked="editor.storage.findAndReplace.caseSensitive"
            @change="event => editor.commands.setCaseSensitive(event.target.checked)"
            data-testid="case-sensitive-checkbox"
          />
          Match case
        </label>
        <label>
          <input
            type="checkbox"
            :checked="editor.storage.findAndReplace.useRegex"
            @change="event => editor.commands.setUseRegex(event.target.checked)"
            data-testid="regex-checkbox"
          />
          Regex
        </label>
      </div>
      <div class="button-group">
        <button
          @click="editor.commands.goToPreviousResult()"
          :disabled="editor.storage.findAndReplace.results.length === 0"
          data-testid="previous-button"
        >
          Previous
        </button>
        <button
          @click="editor.commands.goToNextResult()"
          :disabled="editor.storage.findAndReplace.results.length === 0"
          data-testid="next-button"
        >
          Next
        </button>
        <button
          @click="editor.commands.replace()"
          :disabled="editor.storage.findAndReplace.results.length === 0"
          data-testid="replace-button"
        >
          Replace
        </button>
        <button
          @click="editor.commands.replaceAll()"
          :disabled="editor.storage.findAndReplace.results.length === 0"
          data-testid="replace-all-button"
        >
          Replace all
        </button>
        <button @click="editor.commands.clearSearch()" data-testid="clear-button">Clear</button>
        <span class="result-count" data-testid="result-count">
          {{ resultCount }}
        </span>
      </div>
    </div>
    <editor-content :editor="editor" />
  </div>
</template>

<script>
import Document from '@tiptap/extension-document'
import FindAndReplace from '@tiptap/extension-find-and-replace'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { Editor, EditorContent } from '@tiptap/vue-3'

export default {
  components: {
    EditorContent,
  },

  data() {
    return {
      editor: null,
    }
  },

  computed: {
    resultCount() {
      const { results, currentIndex } = this.editor.storage.findAndReplace

      if (results.length === 0) {
        return 'No results'
      }

      return `${(currentIndex ?? 0) + 1} of ${results.length}`
    },
  },

  mounted() {
    this.editor = new Editor({
      extensions: [Document, Paragraph, Text, FindAndReplace],
      content: `
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
      `,
    })
  },

  beforeUnmount() {
    this.editor.destroy()
  },
}
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
