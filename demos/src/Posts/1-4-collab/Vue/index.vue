<script setup lang="ts">

import Note from './Note.vue'
import { TNote } from './types'

const notes: TNote[] = [
  { id: 'note-1', documentBase64: 'AgHaj462BgCE4If+hAIbEHJhbmRvbSBub3RlIHRleHQG4If+hAIABwEHZGVmYXVsdAMJcGFyYWdyYXBoBwDgh/6EAgAGBADgh/6EAgEFc29tZSCE4If+hAIGD3RvdGFsbHkgcmFuZG9tIIHgh/6EAhUChOCH/oQCFwRub3RlAeCH/oQCAQcV' },
  { id: 'note-2', documentBase64: 'AgHiy6OpCACE4If+hAIbF3JlYWxseSByYW5kb20gbm90ZSB0ZXh0BuCH/oQCAAcBB2RlZmF1bHQDCXBhcmFncmFwaAcA4If+hAIABgQA4If+hAIBBXNvbWUghOCH/oQCBg90b3RhbGx5IHJhbmRvbSCB4If+hAIVAoTgh/6EAhcEbm90ZQHgh/6EAgEHFQ==' },
]

</script>

<template>
  <div v-for="note in notes" :key="note.id">
    <Note :note="note"/>
  </div>
</template>
