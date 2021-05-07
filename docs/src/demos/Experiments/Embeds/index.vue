<template>
  <div v-if="editor">
    <button @click="addImage">
      add iframe
    </button>

    <editor-content :editor="editor" />
  </div>
</template>

<script>
import { Editor, EditorContent } from '@tiptap/vue-2'
import StarterKit from '@tiptap/starter-kit'
import Iframe from './iframe'

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
        StarterKit,
        Iframe,
      ],
      content: `
        <p>Here is an exciting video:</p>
        <iframe src="https://www.youtube.com/embed/XIMLoLxmTDw" frameborder="0" allowfullscreen></iframe>
      `,
    })
  },

  methods: {
    addImage() {
      const url = window.prompt('URL')

      if (url) {
        this.editor.chain().focus().setIframe({ src: url }).run()
      }
    },
  },

  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>

<style lang="scss" scoped>
::v-deep {
  .ProseMirror {
    > * + * {
      margin-top: 0.75em;
    }
  }

  .iframe-wrapper {
    position: relative;
    padding-bottom: 100/16*9%;
    height: 0;
    overflow: hidden;
    width: 100%;
    height: auto;

    &.ProseMirror-selectednode {
      outline: 3px solid #68CEF8;
    }

    iframe {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
  }
}
</style>
