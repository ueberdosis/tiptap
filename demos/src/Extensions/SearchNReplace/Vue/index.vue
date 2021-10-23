<template>
  <div class="search-n-replace">
    <section class="menubar">
      <input type="text" v-model="searchTerm" placeholder="Search term...">

      <input
        @keypress.enter="replace"
        type="text"
        v-model="replaceTerm"
        placeholder="Replace term..."
      >

      <button @click="clear">
        Clear
      </button>
      <button @click="replace">
        Replace
      </button>
      <button @click="replaceAll">
        Replace All
      </button>
    </section>
    <editor-content :editor="editor" />
  </div>
</template>

<script>
import { Editor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import SearchNReplace from '@tiptap/extension-search-n-replace'

export default {
  components: {
    EditorContent,
  },

  data() {
    return {
      editor: null,
      searchTerm: '',
      replaceTerm: '',
    }
  },

  mounted() {
    this.editor = new Editor({
      extensions: [StarterKit, SearchNReplace],
      content: "<p>est for search and replace. search for 'amazing' and replace it with 'awe-inspiring'.</p><p></p><p><strong>tiptap is awesome</strong></p><p><strong>prosemirror is awesome</strong></p><p><strong>vue is awesome</strong></p><p><strong>react is awesome</strong></p>",
    })

    this.updateSearchAndReplaceTerms()
  },

  methods: {
    updateSearchAndReplaceTerms() {
      this.editor.commands.setSearchTerm(this.searchTerm.trim())
      this.editor.commands.setReplaceTerm(this.replaceTerm.trim())
    },
    replace() {
      this.editor.commands.replace()
    },
    clear() {
      this.searchTerm = ''
      this.replaceTerm = ''
    },
    replaceAll() {
      this.editor.commands.replaceAll()
    },
  },

  watch: {
    searchTerm(val, oldVal) {
      if (val === oldVal) return
      this.updateSearchAndReplaceTerms()
    },
    replaceTerm(val, oldVal) {
      if (val === oldVal) return
      this.updateSearchAndReplaceTerms()
    },
  },

  beforeUnmount() {
    this.editor.destroy()
  },
}
</script>

<style lang="scss">
/* Basic editor styles */
.ProseMirror {
  > * + * {
    margin-top: 0.75em;
  }
}

/* Placeholder (at the top) */
.ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: #adb5bd;
  pointer-events: none;
  height: 0;
}

/* Placeholder (on every new line) */
/*.ProseMirror p.is-empty::before {
  content: attr(data-placeholder);
  float: left;
  color: #adb5bd;
  pointer-events: none;
  height: 0;
}*/

.search-result {
  background: rgb(255, 217, 0);
}

.menubar {
  display: flex;
  gap: 1em;
  background: rgba(128, 128, 128, 0.25);
  padding: 0.5em;
  border-radius: 6px;
  justify-content: center;

  input {
    height: 2em;
    border-radius: 6px;
    border: none;
    outline: none;
    padding: 0.4em;
  }

  button {
    border-radius: 6px;
    border: none;
    cursor: pointer;
    background: white;
  }
}
</style>
