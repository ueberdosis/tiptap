<template>
  <div v-if="editor" class="container">
    <div class="control-group">
      <div class="button-group">
        <button @click="editor.commands.showInvisibleCharacters()">Show invisible characters</button>
        <!-- Works as well -->
        <!-- <button @click="editor.commands.showInvisibleCharacters(false)">showInvisibleCharacters(false)</button> -->
        <button @click="editor.commands.hideInvisibleCharacters()">Hide invisible characters</button>
        <button @click="editor.commands.toggleInvisibleCharacters()">Toggle invisible characters</button>
      </div>
      <div>
        <input
          type="checkbox"
          id="show-invisible-characters"
          :checked="editor.storage.invisibleCharacters.visibility()"
          @change="event => editor.commands.showInvisibleCharacters(event.currentTarget.checked)"
        />
        <label for="show-invisible-characters">Show invisibles</label>
      </div>
    </div>
    <editor-content :editor="editor" />
  </div>
</template>

<script>
import Document from '@tiptap/extension-document'
import HardBreak from '@tiptap/extension-hard-break'
import Heading from '@tiptap/extension-heading'
import InvisibleCharacters from '@tiptap/extension-invisible-characters'
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

  mounted() {
    this.editor = new Editor({
      extensions: [Document, Paragraph, Text, Heading, InvisibleCharacters, HardBreak],
      content: `
        <h1>
          This is a heading.
        </h1>
        <p>
          This<br>is<br>a<br>paragraph.
        </p>
        <p>
          This is a paragraph, but without breaks.
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
</style>
