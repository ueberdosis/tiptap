<script setup lang="ts">

import { TiptapCollabProvider } from '@hocuspocus/provider'
import { Collaboration } from '@tiptap/extension-collaboration'
import StarterKit from '@tiptap/starter-kit'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import { fromBase64 } from 'lib0/buffer'
import { onMounted, onUnmounted } from 'vue'
import * as Y from 'yjs'

import type { TNote } from './types'

const props = defineProps<{ note: TNote }>()

let provider: TiptapCollabProvider | undefined

const createDocFromBase64 = (base64Update: string) => {
  const doc = new Y.Doc()

  Y.applyUpdate(doc, fromBase64(base64Update))

  return doc
}

// usually, you'd just do `new Y.Doc()` here. We are doing some magic to make sure you can just switch to your APP and you have the same document
const doc = createDocFromBase64(props.note.documentBase64)

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
  <editor-content :editor="editor"></editor-content>
</template>
