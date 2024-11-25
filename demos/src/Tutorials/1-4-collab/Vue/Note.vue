<script setup lang="ts">

import { TiptapCollabProvider } from '@hocuspocus/provider'
import { Collaboration } from '@tiptap/extension-collaboration'
import StarterKit from '@tiptap/starter-kit'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import { onMounted, onUnmounted } from 'vue'
import * as Y from 'yjs'

import type { TNote } from './types.js'

const props = defineProps<{ note: TNote }>()

let provider: TiptapCollabProvider | undefined

const doc = new Y.Doc()

onMounted(() => {
  provider = new TiptapCollabProvider({
    name: props.note.id, // any identifier - all connections sharing the same identifier will be synced
    appId: '7j9y6m10', // replace with YOUR_APP_ID
    token: 'notoken', // replace with your JWT
    document: doc,
  })
})

onUnmounted(() => provider?.destroy())

const editor = useEditor({
  // make sure that you don't use `content` property anymore!
  // If you want to add default content, feel free to just write text to the Tiptap editor (i.e. editor.setContent (https://tiptap.dev/api/commands/set-content), but make sure that
  // you do this only once per document, otherwise the content will
  // be added again, and again, and again ..
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
