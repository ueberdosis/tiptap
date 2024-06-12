<script setup lang="ts">

import './styles.css'

import Note from './Note.vue'
import { TNote } from './types.js'

const notes: TNote[] = [
  { id: 'note-1', content: 'some random note text' },
  { id: 'note-2', content: 'some really random note text' },
]

</script>

<template>
  <div v-for="note in notes" :key="note.id">
    <Note :note="note"/>
  </div>
</template>
