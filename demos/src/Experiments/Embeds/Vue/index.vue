<template>
  <div v-if="editor" class="container">
    <div class="control-group">
      <div class="button-group">
        <button @click="addIframe">Add iFrame</button>
      </div>
    </div>
    <editor-content :editor="editor" />
  </div>
</template>

<script>
import StarterKit from '@tiptap/starter-kit'
import { Editor, EditorContent } from '@tiptap/vue-3'

import Iframe from './iframe.ts'

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
      extensions: [StarterKit, Iframe],
      content: `
        <p>Here is an exciting video:</p>
        <iframe src="https://www.youtube.com/embed/XIMLoLxmTDw" frameborder="0" allowfullscreen></iframe>
      `,
    })
  },

  methods: {
    addIframe() {
      const url = window.prompt('URL')

      if (url) {
        this.editor.chain().focus().setIframe({ src: url }).run()
      }
    },
  },

  beforeUnmount() {
    this.editor.destroy()
  },
}
</script>

<style lang="scss">
@use 'sass:math';
.tiptap {
  > * + * {
    margin-top: 0.75em;
  }
}

.iframe-wrapper {
  position: relative;
  padding-bottom: math.div(100, 16) * 9%;
  height: 0;
  overflow: hidden;
  width: 100%;
  height: auto;

  &.ProseMirror-selectednode {
    outline: 3px solid #68cef8;
  }

  iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
}
</style>
