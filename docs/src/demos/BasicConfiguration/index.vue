<template>
  <div class="editor">
    <editor-menu-bar :editor="editor" v-slot="{ commands, isActive }">
        <div class="menubar">

          <button
            class="menubar__button"
            :class="{ 'is-active': isActive.bold() }"
            @click="commands.bold"
          >
            <icon name="bold" />
          </button>

        </div>
      </editor-menu-bar>

    <editor-content :editor="editor" />
  </div>
</template>

<script>
import { Editor } from '@tiptap/core'
import { EditorContent, Renderer, EditorMenuBar } from '@tiptap/vue'
import extensions, { Bold } from '@tiptap/starter-kit'

export default {
  components: {
    EditorContent,
    EditorMenuBar,
  },

  data() {
    return {
      editor: null,
    }
  },

  mounted() {
    this.editor = new Editor({
      content: '<p>I’m running tiptap with Vue.js. This demo is interactive, try to edit the text.</p>',
      extensions: extensions([
        new Bold,
      ]),
      renderer: Renderer,
    })
  },

  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>