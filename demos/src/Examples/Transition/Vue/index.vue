<script setup lang="ts">

import StarterKit from '@tiptap/starter-kit'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import { ref } from 'vue'

import VueComponent from './Extension.js'
import type { TNote } from './types.js'

const note = ref<TNote>({
  id: 'note-1',
  content: `
  <p>Some random note text</p>
  <vue-component count="0"></vue-component>
  `,
})

const editor = useEditor({
  content: note.value.content,
  editorProps: {
    attributes: {
      class: 'textarea',
    },
  },
  extensions: [
    StarterKit,
    VueComponent,
  ],
})

const showEditor = ref(false)

</script>

<template>
  <div>
    <button
      type="button"
      @click="showEditor = !showEditor"
      style="margin-bottom: 1rem;"
      id="toggle-editor"
    >
      {{ showEditor ? 'Hide editor' : 'Show editor' }}
    </button>

    <transition name="fade">
      <div v-if="showEditor" class="tiptap-wrapper">
        <editor-content :editor="editor" />
      </div>
    </transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 1s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.tiptap-wrapper {
  background-color: var(--purple-light);
  border: 2px solid var(--purple);
  border-radius: 0.5rem;
  margin: 1rem 0;
}
</style>
