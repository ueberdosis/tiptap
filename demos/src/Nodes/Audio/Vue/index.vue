<template>
  <div class="control-group">
    <div class="control">
      <label for="src">Audio source</label>
      <input id="src" v-model="src" type="text" placeholder="https://.../audio.mp3" />
    </div>

    <div class="control">
      <label for="preload">Preload</label>
      <select id="preload" v-model="preload">
        <option value="metadata">metadata</option>
        <option value="auto">auto</option>
        <option value="none">none</option>
        <option value="">(empty)</option>
      </select>
    </div>

    <div class="control">
      <label for="controlsList">controlslist</label>
      <input id="controlsList" v-model="controlsList" type="text" placeholder="nodownload noplaybackrate" />
    </div>

    <div class="control">
      <label for="crossorigin">crossorigin</label>
      <select id="crossorigin" v-model="crossorigin">
        <option value="">(unset)</option>
        <option value="anonymous">anonymous</option>
        <option value="use-credentials">use-credentials</option>
      </select>
    </div>
  </div>

  <div class="control-group toggles">
    <div class="control">
      <label>
        <input v-model="controls" type="checkbox" />
        Show controls
      </label>
    </div>
    <div class="control">
      <label>
        <input v-model="autoplay" type="checkbox" />
        Autoplay
      </label>
    </div>
    <div class="control">
      <label>
        <input v-model="loop" type="checkbox" />
        Loop
      </label>
    </div>
    <div class="control">
      <label>
        <input v-model="muted" type="checkbox" />
        Muted
      </label>
    </div>
    <div class="control">
      <label>
        <input v-model="disableRemotePlayback" type="checkbox" />
        Disable remote playback
      </label>
    </div>
  </div>

  <button class="insert" type="button" @click="insertAudio" :disabled="!editor">Insert audio</button>

  <editor-content :editor="editor" />
</template>

<script>
import Audio from '@tiptap/extension-audio'
import StarterKit from '@tiptap/starter-kit'
import { Editor, EditorContent } from '@tiptap/vue-3'

const DEFAULT_AUDIO_SRC = 'https://www.w3schools.com/html/horse.ogg'

export default {
  components: {
    EditorContent,
  },

  data() {
    return {
      editor: null,
      src: DEFAULT_AUDIO_SRC,
      autoplay: false,
      loop: true,
      muted: false,
      controls: true,
      preload: 'metadata',
      controlsList: 'nodownload',
      crossorigin: '',
      disableRemotePlayback: false,
    }
  },

  mounted() {
    this.editor = new Editor({
      extensions: [
        StarterKit.configure({
          history: false,
        }),
        Audio.configure({
          controls: true,
          preload: 'metadata',
        }),
      ],
      content: `
        <p>Use the controls above to insert audio tracks with native elements.</p>
        <audio src="${DEFAULT_AUDIO_SRC}" controls loop preload="metadata"></audio>
      `,
      editorProps: {
        attributes: {
          spellcheck: 'false',
        },
      },
    })
  },

  beforeUnmount() {
    this.editor?.destroy()
  },

  methods: {
    insertAudio() {
      if (!this.editor || !this.src) {
        return
      }

      this.editor
        .chain()
        .focus()
        .setAudio({
          src: this.src,
          controls: this.controls,
          autoplay: this.autoplay,
          loop: this.loop,
          muted: this.muted,
          preload: this.preload || null,
          controlslist: this.controlsList || undefined,
          crossorigin: this.crossorigin || undefined,
          disableremoteplayback: this.disableRemotePlayback || undefined,
        })
        .run()
    },
  },
}
</script>

<style lang="scss">
:root {
  color-scheme: light;
}

.control-group {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  width: min(100%, 64rem);
  margin-bottom: 1rem;
}

.control {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.9rem;
}

.control input,
.control select {
  padding: 0.45rem 0.55rem;
  border-radius: 0.45rem;
  border: 1px solid #e5e7eb;
  background: #fff;
  font-size: 0.9rem;
}

.control label {
  color: #4b5563;
  font-weight: 600;
}

.control-group.toggles {
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
}

.control-group.toggles .control {
  align-self: center;
}

.control-group.toggles label {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-weight: 500;
}

.insert {
  background: #111827;
  border: 1px solid #111827;
  color: #fff;
  border-radius: 0.75rem;
  padding: 0.65rem 1rem;
  font-weight: 600;
  width: min(100%, 64rem);
  margin-bottom: 1rem;
  cursor: pointer;
  display: block;
}

.insert:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.tiptap {
  background-color: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1rem;
  min-height: 12rem;
  width: 100%;
}

.tiptap p {
  margin: 0.5rem 0;
}

.tiptap audio {
  width: 100%;
  max-width: 64rem;
  display: block;
  margin: 0.75rem 0;
}
</style>
