<template>
  <div v-if="editor" class="container">
    <div class="control-group">
      <div class="button-group">
        <button
          @click="editor.chain().focus().toggleSuperscript().run()"
          :class="{ 'is-active': editor.isActive('superscript') }"
        >
          Toggle superscript
        </button>
        <button @click="editor.chain().focus().setSuperscript().run()" :disabled="editor.isActive('superscript')">
          Set superscript
        </button>
        <button @click="editor.chain().focus().unsetSuperscript().run()" :disabled="!editor.isActive('superscript')">
          Unset superscript
        </button>
      </div>
    </div>
    <editor-content :editor="editor" />
  </div>
</template>

<script>
import Document from '@dibdab/extension-document'
import Paragraph from '@dibdab/extension-paragraph'
import Superscript from '@dibdab/extension-superscript'
import Text from '@dibdab/extension-text'
import { Editor, EditorContent } from '@dibdab/vue-3'

export default {
  components: {
    EditorContent,
  },

  data() {
    return {
      editor: null,
    }
  },

  mounted() {
    this.editor = new Editor({
      extensions: [Document, Paragraph, Text, Superscript],
      content: `
        <p>This is regular text.</p>
        <p><sup>This is superscript.</sup></p>
        <p><span style="vertical-align: super">And this.</span></p>
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
</style>
