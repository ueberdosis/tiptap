<template>
  <div v-if="editor" class="container">
    <div class="control-group">
      <div class="button-group">
        <input
          id="width"
          type="number"
          v-model="width"
          placeholder="width"
          min="320"
          max="1024"
        >
        <input
          id="height"
          type="number"
          v-model="height"
          placeholder="height"
          min="180"
          max="720"
        >
        <button id="add" @click="addVideo">
          Add YouTube video
        </button>
      </div>
    </div>
    <editor-content :editor="editor" />
  </div>
</template>

<script>
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Youtube from '@tiptap/extension-youtube'
import { Editor, EditorContent } from '@tiptap/vue-3'

export default {
  components: {
    EditorContent,
  },

  data() {
    return {
      editor: null,
      width: '640',
      height: '480',
    }
  },

  mounted() {
    this.editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        Youtube.configure({
          controls: false,
          nocookie: true,
        }),
      ],
      content: `
        <p>Tiptap now supports YouTube embeds! Awesome!</p>
        <div data-youtube-video>
          <iframe src="https://www.youtube.com/watch?v=3lTUAWOgoHs"></iframe>
        </div>
        <p>Try adding your own video to this editor!</p>
      `,
      editorProps: {
        attributes: {
          spellcheck: 'false',
        },
      },
    })
  },

  methods: {
    addVideo() {
      const url = prompt('Enter YouTube URL')

      this.editor.commands.setYoutubeVideo({
        src: url,
        width: Math.max(320, parseInt(this.width, 10)) || 640,
        height: Math.max(180, parseInt(this.height, 10)) || 480,
      })
    },
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

  /* Youtube embed */
  div[data-youtube-video] {
    cursor: move;
    padding-right: 1.5rem;

    iframe {
      border: 0.5rem solid var(--black-contrast);
      display: block;
      min-height: 200px;
      min-width: 200px;
      outline: 0px solid transparent;
    }

    &.ProseMirror-selectednode iframe {
      outline: 3px solid var(--purple);
      transition: outline 0.15s;
    }
  }
}
</style>
