<template>
  <div style="display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: center; padding: 1.5rem">
    <input
      v-model="src"
      type="text"
      style="flex-grow: 1"
      placeholder="https://.../audio.mp3"
      aria-label="Audio source"
    />

    <button class="primary" type="button" @click="insertAudio" :disabled="!editor">
      Insert audio
    </button>

    <button type="button" popovertarget="audio-options">Additional Options</button>
  </div>

  <div id="audio-options" popover="auto" class="additional-options-popover">
    <div class="control-group additional-options-group">
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
        <input
          id="controlsList"
          v-model="controlsList"
          type="text"
          placeholder="nodownload noplaybackrate"
        />
      </div>

      <div class="control">
        <label for="crossorigin">crossorigin</label>
        <select id="crossorigin" v-model="crossorigin">
          <option value="">(unset)</option>
          <option value="anonymous">anonymous</option>
          <option value="use-credentials">use-credentials</option>
        </select>
      </div>

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
  </div>

  <editor-content :editor="editor" />
</template>

<script>
import Audio from '@tiptap/extension-audio'
import StarterKit from '@tiptap/starter-kit'
import { Editor, EditorContent } from '@tiptap/vue'

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

.additional-options-popover {
  border: 0;
  border-radius: 0.75rem;
  inset: auto;
  margin: 0.5rem 0 0;
  max-width: calc(100vw - 3rem);
  padding: 0;
  position-area: bottom span-left;
}

.additional-options-group {
  margin: 0;
}

.additional-options-group .control label {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-weight: 500;
}

.tiptap audio {
  width: 100%;
  max-width: 64rem;
  display: block;
  margin: 0.75rem 0;
}
</style>
