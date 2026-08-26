import assert from 'node:assert/strict'
import test from 'node:test'

import { transformVueSource } from '../scripts/vue-sfc-imports.mjs'

test('migrates imports inside Vue script blocks', () => {
  const source = `<template>{{ '@tiptap/vue-3' }}</template>
<script setup lang="ts">
import { EditorContent } from '@tiptap/vue-3'
export { EditorContent } from '@tiptap/vue-3'
export * from '@tiptap/extension-drag-handle-vue-3'
import '@tiptap/vue-3'
import '@tiptap/extension-drag-handle-vue-3'
const DragHandle = require('@tiptap/extension-drag-handle-vue-3')
const example = "import('@tiptap/vue-3')"
// require('@tiptap/extension-drag-handle-vue-3')
const legacyPackage = '@tiptap/vue-2'
</script>`

  const expected = `<template>{{ '@tiptap/vue-3' }}</template>
<script setup lang="ts">
import { EditorContent } from '@tiptap/vue'
export { EditorContent } from '@tiptap/vue'
export * from '@tiptap/extension-drag-handle-vue'
import '@tiptap/vue'
import '@tiptap/extension-drag-handle-vue'
const DragHandle = require('@tiptap/extension-drag-handle-vue')
const example = "import('@tiptap/vue-3')"
// require('@tiptap/extension-drag-handle-vue-3')
const legacyPackage = '@tiptap/vue-2'
</script>`

  assert.equal(transformVueSource(source), expected)
})

test('does not scan past local exports', () => {
  const source = `<script setup>
export { Local }
import { EditorContent } from '@tiptap/vue-3'
</script>`

  const expected = `<script setup>
export { Local }
import { EditorContent } from '@tiptap/vue'
</script>`

  assert.equal(transformVueSource(source), expected)
})
