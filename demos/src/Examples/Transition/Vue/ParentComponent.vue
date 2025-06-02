<template>
  <div>
    <EditorContent :editor="editor" />
  </div>
</template>

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

</script>
