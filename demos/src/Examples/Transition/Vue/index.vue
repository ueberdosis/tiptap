<script setup lang="ts">
import StarterKit from '@tiptap/starter-kit'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import { ref } from 'vue'

import VueComponent from './Extension.js'
import ParentComponent from './ParentComponent.vue'
import type { TNote } from './types.js'

const showDirectEditor = ref(false)

const showNestedEditor = ref(false)

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

</script>

<template>
  <div>
    <button
      type="button"
      @click="showDirectEditor = !showDirectEditor"
      style="margin-bottom: 1rem;"
      id="toggle-editor"
    >
      {{ showDirectEditor ? 'Hide direct editor' : 'Show direct editor' }}
    </button>

    <transition name="fade">
      <div v-if="showDirectEditor" class="tiptap-wrapper">
        <EditorContent :editor="editor" />
      </div>
    </transition>
  </div>

  <hr>

  <div>
    <button
      type="button"
      @click="showNestedEditor = !showNestedEditor"
      style="margin-bottom: 1rem;"
      id="toggle-editor"
    >
      {{ showNestedEditor ? 'Hide nested editor' : 'Show nested editor' }}
    </button>

    <transition name="fade">
      <div v-if="showNestedEditor" class="tiptap-wrapper">
        <ParentComponent />
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

hr {
  margin-top: 2rem;
  margin-bottom: 2rem;
}

.tiptap-wrapper {
  background-color: var(--purple-light);
  border: 2px solid var(--purple);
  border-radius: 0.5rem;
  margin: 1rem 0;
}
</style>
