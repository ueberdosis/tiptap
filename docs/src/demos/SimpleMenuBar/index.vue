<template>
  <div class="editor">
    <div class="menubar" v-if="editor">

      <button
        class="menubar__button"
        :class="{ 'is-active': editor.isActive('bold') }"
        @click="editor.focus().bold()"
      >
        Bold
      </button>

    </div>

    <editor-content :editor="editor" />
  </div>
</template>

<script>
import { Editor } from '@tiptap/core'
import { EditorContent, Renderer } from '@tiptap/vue'
import extensions from '@tiptap/starter-kit'

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
      content: '<p>I’m running tiptap with Vue.js. This demo is interactive, try to edit the text.</p>',
      extensions: extensions(),
      renderer: Renderer,
    })
  },

  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>