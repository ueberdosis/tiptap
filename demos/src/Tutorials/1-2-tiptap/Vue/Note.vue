<script setup lang="ts">

import StarterKit from '@tiptap/starter-kit'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import { ref, watch } from 'vue'

import type { TNote } from './types.js'

const props = defineProps<{note: TNote}>()

const modelValueProxy = ref('')

watch(props, () => modelValueProxy.value = props.note.content)

const editor = useEditor({
  content: props.note.content,
  editorProps: {
    attributes: {
      class: 'textarea',
    },
  },
  extensions: [
    StarterKit,
  ],
})

const showEditor = ref(false)

</script>

<template>
  <div>
    <button type="button" @click="showEditor = !showEditor" style="margin-bottom: 1rem;">
      {{ showEditor ? 'Hide editor' : 'Show editor' }}
    </button>

    <transition name="fade">
      <div v-if="showEditor" style="background-color: pink; border: 1px solid black; padding: 1rem;">
        <editor-content :editor="editor" />
      </div>
    </transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
