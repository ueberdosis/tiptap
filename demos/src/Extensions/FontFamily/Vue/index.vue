<template>
  <div v-if="editor" class="container">
    <div class="control-group">
      <div class="button-group">
        <button
          @click="editor.chain().focus().setFontFamily('Inter').run()"
          :class="{ 'is-active': editor.isActive('textStyle', { fontFamily: 'Inter' }) }"
        >
          Inter
        </button>
        <button
          @click="editor.chain().focus().setFontFamily('Comic Sans MS, Comic Sans').run()"
          :class="{ 'is-active': editor.isActive('textStyle', { fontFamily: 'Comic Sans MS, Comic Sans' }) }"
        >
          Comic Sans
        </button>
        <button
          @click="editor.chain().focus().setFontFamily('serif').run()"
          :class="{ 'is-active': editor.isActive('textStyle', { fontFamily: 'serif' }) }"
        >
          Serif
        </button>
        <button
          @click="editor.chain().focus().setFontFamily('monospace').run()"
          :class="{ 'is-active': editor.isActive('textStyle', { fontFamily: 'monospace' }) }"
        >
          Monospace
        </button>
        <button
          @click="editor.chain().focus().setFontFamily('cursive').run()"
          :class="{ 'is-active': editor.isActive('textStyle', { fontFamily: 'cursive' }) }"
        >
          Cursive
        </button>
        <button @click="editor.chain().focus().unsetFontFamily().run()">Unset font family</button>
      </div>
    </div>
    <editor-content :editor="editor" />
  </div>
</template>

<script>
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { FontFamily, TextStyle } from '@tiptap/extension-text-style'
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
      extensions: [Document, Paragraph, Text, TextStyle, FontFamily],
      content: `
        <p><span style="font-family: Inter">Did you know that Inter is a really nice font for interfaces?</span></p>
        <p><span style="font-family: Comic Sans MS, Comic Sans">It doesn’t look as professional as Comic Sans.</span></p>
        <p><span style="font-family: serif">Serious people use serif fonts anyway.</span></p>
        <p><span style="font-family: monospace">The cool kids can apply monospace fonts aswell.</span></p>
        <p><span style="font-family: cursive">But hopefully we all can agree, that cursive fonts are the best.</span></p>
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
