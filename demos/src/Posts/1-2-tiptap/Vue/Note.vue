<script setup lang="ts">

import StarterKit from '@tiptap/starter-kit'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import { ref, watch } from 'vue'

import type { TNote } from './types'

const props = defineProps<{note: TNote}>()

const modelValueProxy = ref('')

watch(props, () => modelValueProxy.value = props.note.content)

const editor = useEditor({
  content: props.note.content,
  extensions: [
    StarterKit,
  ],
})

</script>

<template>
  <editor-content :editor="editor"></editor-content>
</template>
