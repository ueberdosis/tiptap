<script setup lang="ts">

import './styles.scss'

import Note from './Note.vue'
import { TNote } from './types.js'

const notes: TNote[] = [
  { id: 'note-1' },
  { id: 'note-2' },
]

</script>

<template>
  <template v-for="note in notes" :key="note.id">
    <Note :note="note" />
  </template>
</template>
