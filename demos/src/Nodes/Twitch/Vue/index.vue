<template>
  <div v-if="editor" class="container">
    <div class="control-group">
      <div class="button-group">
        <input id="width" type="number" v-model="width" placeholder="width" min="320" max="1024" />
        <input id="height" type="number" v-model="height" placeholder="height" min="180" max="720" />
        <button id="add" @click="addVideo">Add Twitch video</button>
      </div>
    </div>
    <editor-content :editor="editor" />
  </div>
</template>

<script>
import Document from '@tiptap/extension-document'
import Heading from '@tiptap/extension-heading'
import { ListKit } from '@tiptap/extension-list'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Twitch from '@tiptap/extension-twitch'
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
        Heading,
        Paragraph,
        ListKit,
        Text,
        Twitch.configure({
          parent: window.location.hostname,
          allowFullscreen: true,
        }),
      ],
      content: `
        <p>Tiptap now supports Twitch embeds! Awesome!</p>
        <p>It supports</p>
        <ul>
          <li>
            <p>Different types of content</p>
            <ul>
              <li>Channels</li>
              <li>Videos</li>
              <li>& Clips</li>
            </ul>
          </li>
          <li>
            <p>Customizable parameters</p>
            <ul>
              <li>Muted</li>
              <li>Autoplay</li>
              <li>Start time</li>
            </ul>
          </li>
        </ul>
        <h2>Channel</h2>
        <div data-twitch-video>
          <iframe src="https://www.twitch.tv/LofiGirl" muted="true"></iframe>
        </div>
        <h2>Videos</h2>
        <div data-twitch-video>
          <iframe src="https://www.twitch.tv/videos/2409205759" muted="true"></iframe>
        </div>
        <h2>Clips</h2>
        <div data-twitch-video>
          <iframe src="https://www.twitch.tv/nasa/clip/CooperativeBrainyJellyfishPJSugar-0TPiyjN_MNkrcErt" muted="true"></iframe>
        </div>
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
      const url = prompt('Enter Twitch video URL')

      this.editor.commands.setTwitchVideo({
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

  /* Twitch embed */
  div[data-twitch-video] {
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
