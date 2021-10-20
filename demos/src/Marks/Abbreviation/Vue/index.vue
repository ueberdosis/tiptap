<template>
  <div v-if="editor">
    <button @click="toggleAbbreviation" :class="{ 'is-active': editor.isActive('abbreviation') }">
      toggleAbbreviation
    </button>
    <button @click="setAbbreviation" :disabled="editor.isActive('abbreviation')">
      setAbbreviation
    </button>
    <button @click="editor.chain().focus().extendMarkRange('abbreviation').unsetAbbreviation().run()" :disabled="!editor.isActive('abbreviation')">
      unsetAbbreviation
    </button>

    <editor-content :editor="editor" />
  </div>
</template>

<script>
import { Editor, EditorContent } from '@tiptap/vue-3'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Abbreviation from '@tiptap/extension-abbreviation'

export default {
  components: {
    EditorContent,
  },

  data() {
    return {
      editor: null,
    }
  },

  methods: {
    toggleAbbreviation() {
      if (this.editor.isActive('abbreviation')) {
        return this.editor.chain()
          .extendMarkRange('abbreviation')
          .unsetAbbreviation()
          .focus()
          .run()
      }

      const title = window.prompt('What’s the description or expansion of the abbreviation?')

      this.editor.chain()
        .focus()
        .toggleAbbreviation(title)
        .run()
    },
    setAbbreviation() {
      const title = window.prompt('What’s the description or expansion of the abbreviation?')

      this.editor.chain()
        .focus()
        .setAbbreviation(title)
        .run()
    },
  },

  mounted() {
    this.editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        Abbreviation,
      ],
      content: `
        <p>You can use <abbr title="Cascading Style Sheets">CSS</abbr> to style your <abbr title="HyperText Markup Language">HTML</abbr>.</p>
      `,
    })
  },

  beforeUnmount() {
    this.editor.destroy()
  },
}
</script>
