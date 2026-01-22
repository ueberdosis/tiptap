<template>
  <div v-if="editor" class="container">
    <div class="control-group">
      <div class="button-group">
        <button
          @click="editor.chain().focus().toggleStrike().run()"
          :class="{ 'is-active': editor.isActive('strike') }"
        >
          Toggle strike
        </button>
        <button @click="editor.chain().focus().setStrike().run()" :disabled="editor.isActive('strike')">
          Set strike
        </button>
        <button @click="editor.chain().focus().unsetStrike().run()" :disabled="!editor.isActive('strike')">
          Unset strike
        </button>
      </div>
    </div>
    <editor-content :editor="editor" />
  </div>
</template>

<script>
import Document from '@dibdab/extension-document'
import Paragraph from '@dibdab/extension-paragraph'
import Strike from '@dibdab/extension-strike'
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
      extensions: [Document, Paragraph, Text, Strike],
      content: `
          <p>This isn’t striked through.</s></p>
          <p><s>But that’s striked through.</s></p>
          <p><del>And this.</del></p>
          <p><strike>This too.</strike></p>
          <p style="text-decoration: line-through">This as well.</p>
        `,
    })
  },

  beforeUnmount() {
    this.editor.destroy()
  },
}
</script>
