<template>
  <div v-if="editor">
    <div class="control-group">
      <div class="button-group">
        <label>
          Highlight term:
          <input type="text" :value="term" placeholder="Search term" @input="onTermChange" />
        </label>
        <button @click="editor.commands.updateDecorations()">Re-apply</button>
      </div>
    </div>
    <editor-content :editor="editor" />
  </div>
</template>

<script>
import './styles.scss'

import StarterKit from '@tiptap/starter-kit'
import { Editor, EditorContent } from '@tiptap/vue-3'

import { HighlightDecorations } from './highlight-decorations.ts'

const initialTerm = 'tiptap'

export default {
  components: {
    EditorContent,
  },

  data() {
    return {
      editor: null,
      term: initialTerm,
    }
  },

  mounted() {
    this.editor = new Editor({
      extensions: [StarterKit, HighlightDecorations.configure({ term: initialTerm })],
      content: `
        <h2>The Decorations API</h2>
        <p>
          With the new Decorations API, an extension can declare its decorations the
          same way it declares commands or keymaps. This Tiptap demo highlights every
          occurrence of a search term using an <strong>inline</strong> decoration, adds
          a <strong>widget</strong> marker before each match, and outlines headings with
          a <strong>node</strong> decoration.
        </p>
        <h2>Try it out</h2>
        <p>
          Change the search term below — Tiptap forces a recompute with
          <code>updateDecorations</code>. Editing the document recomputes automatically.
        </p>
      `,
    })
  },

  unmounted() {
    this.editor.destroy()
  },

  methods: {
    onTermChange(event) {
      this.term = event.target.value
      this.editor.storage.highlightDecorations.term = this.term
      this.editor.commands.updateDecorations('highlightDecorations')
    },
  },
}
</script>
