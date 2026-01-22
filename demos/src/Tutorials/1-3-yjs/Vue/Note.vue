<script setup lang="ts">
import { Collaboration } from '@dibdab/extension-collaboration'
import StarterKit from '@dibdab/starter-kit'
import { EditorContent, useEditor } from '@dibdab/vue-3'
import * as Y from 'yjs'

import type { TNote } from './types.js'

const props = defineProps<{ note: TNote }>()

const doc = new Y.Doc()

const editor = useEditor({
  content: props.note.defaultContent,
  editorProps: {
    attributes: {
      class: 'textarea',
    },
  },
  extensions: [
    StarterKit.configure({
      history: false, // important because history will now be handled by Y.js
    }),
    Collaboration.configure({
      document: doc,
    }),
  ],
})
</script>

<template>
  <editor-content :editor="editor" />
</template>
