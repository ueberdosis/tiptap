<template>
  <div v-if="editor" class="container">
    <div class="control-group">
      <div class="button-group">
        <button
          @click="editor.chain().focus().toggleUnderline().run()"
          :class="{ 'is-active': editor.isActive('underline') }"
        >
          Toggle underline
        </button>
        <button
          @click="editor.chain().focus().setUnderline().run()"
          :disabled="editor.isActive('underline')"
        >
          Set underline
        </button>
        <button
          @click="editor.chain().focus().unsetUnderline().run()"
          :disabled="!editor.isActive('underline')"
        >
          Unset underline
        </button>
      </div>
    </div>
    <editor-content :editor="editor" />
  </div>
</template>

<script>
import { Document } from '@tiptap/editor/extensions/document'
import { Paragraph } from '@tiptap/editor/extensions/paragraph'
import { Text } from '@tiptap/editor/extensions/text'
import { Underline } from '@tiptap/editor/extensions/underline'
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
      extensions: [Document, Paragraph, Text, Underline],
      content: `
        <p>There is no underline here.</p>
        <p><u>This is underlined though.</u></p>
        <p style="text-decoration: underline">And this as well.</p>
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
