<template>
  <div>
    <div v-if="editor">
      <button id="add" @click="addVideo">
        Add youtube video
      </button>
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
      <editor-content class="editor-1" :editor="editor" />
    </div>
  </div>
</template>

<script>
import Youtube from '@tiptap/extension-youtube'
import StarterKit from '@tiptap/starter-kit'
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
        StarterKit,
        Youtube.configure({
          controls: false,
        }),
      ],
      content: `
        <p>Tiptap now supports youtube embeds! Awesome!</p>
        <div data-youtube-video>
          <iframe src="https://www.youtube.com/watch?v=cqHqLQgVCgY"></iframe>
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
.ProseMirror {
  > * + * {
    margin-top: 0.75em;
  }

  ul,
  ol {
    padding: 0 1rem;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    line-height: 1.1;
  }

  code {
    background-color: rgba(#616161, 0.1);
    color: #616161;
  }

  pre {
    background: #0D0D0D;
    color: #FFF;
    font-family: 'JetBrainsMono', monospace;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;

    code {
      color: inherit;
      padding: 0;
      background: none;
      font-size: 0.8rem;
    }
  }

  img {
    max-width: 100%;
    height: auto;
  }

  hr {
    margin: 1rem 0;
  }

  blockquote {
    padding-left: 1rem;
    border-left: 2px solid rgba(#0D0D0D, 0.1);
  }

  iframe {
    border: 8px solid #000;
    border-radius: 4px;
    min-width: 200px;
    min-height: 200px;
    display: block;
    outline: 0px solid transparent;
  }

  div[data-youtube-video] {
    cursor: move;
    padding-right: 24px;
  }

  .ProseMirror-selectednode iframe {
    transition: outline 0.15s;
    outline: 6px solid #ece111;
  }
}

</style>
