import assert from 'node:assert/strict'
import test from 'node:test'

import { transformVueSource } from '../scripts/vue-sfc-imports.mjs'

test('migrates imports inside Vue script blocks', () => {
  const source = `<template>{{ '@tiptap/vue-3' }}</template>
<script setup lang="ts">
import { EditorContent } from '@tiptap/vue-3'
const DragHandle = require('@tiptap/extension-drag-handle-vue-3')
const legacyPackage = '@tiptap/vue-2'
</script>`

  const expected = `<template>{{ '@tiptap/vue-3' }}</template>
<script setup lang="ts">
import { EditorContent } from '@tiptap/vue'
const DragHandle = require('@tiptap/extension-drag-handle-vue')
const legacyPackage = '@tiptap/vue-2'
</script>`

  assert.equal(transformVueSource(source), expected)
})
