<template>
  <div v-if="editor">
    <button
      @click="editor.chain().focus().fontFamily('Inter').run()"
      :class="{ 'is-active': editor.isActive('textStyle', { fontFamily: 'Inter' }) }"
    >
      Inter
    </button>
    <button
      @click="editor.chain().focus().fontFamily('Comic Sans MS, Comic Sans').run()"
      :class="{ 'is-active': editor.isActive('textStyle', { fontFamily: 'Comic Sans MS, Comic Sans' }) }"
    >
      Comic Sans
    </button>
    <button
      @click="editor.chain().focus().fontFamily('serif').run()"
      :class="{ 'is-active': editor.isActive('textStyle', { fontFamily: 'serif' }) }"
    >
      serif
    </button>
    <button
      @click="editor.chain().focus().fontFamily('monospace').run()"
      :class="{ 'is-active': editor.isActive('textStyle', { fontFamily: 'monospace' }) }"
    >
      monospace
    </button>
    <button
      @click="editor.chain().focus().fontFamily('cursive').run()"
      :class="{ 'is-active': editor.isActive('textStyle', { fontFamily: 'cursive' }) }"
    >
      cursive
    </button>

    <editor-content :editor="editor" />
  </div>
</template>

<script>
import { Editor } from '@tiptap/core'
import { EditorContent } from '@tiptap/vue'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import TextStyle from '@tiptap/extension-text-style'
import FontFamily from '@tiptap/extension-font-family'

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
      extensions: [
        Document(),
        Paragraph(),
        Text(),
        TextStyle(),
        FontFamily(),
      ],
      content: `
        <p><span style="font-family: Inter">Inter</span></p>
        <p><span style="font-family: Comic Sans MS, Comic Sans">Comic Sans</span></p>
        <p><span style="font-family: serif">serif</span></p>
        <p><span style="font-family: monospace">monospace</span></p>
        <p><span style="font-family: cursive">cursive</span></p>
      `,
    })
  },

  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>
