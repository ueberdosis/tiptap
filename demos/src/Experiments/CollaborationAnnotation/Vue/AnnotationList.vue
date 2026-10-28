<template>
  <div class="output-group annotation-list">
    <h3>Annotations</h3>
    <p v-if="annotations.length === 0">Select text or an image to add the first annotation.</p>
    <ul v-else>
      <li
        v-for="annotation in annotations"
        :key="annotation.id"
        :data-annotation-id="annotation.id"
      >
        <p>{{ annotation.text }}</p>
        <small
          >{{ annotation.kind }} ·
          {{
            annotation.from === null
              ? 'Unresolved'
              : `Attached at ${annotation.from}-${annotation.to}`
          }}</small
        >
        <div class="button-group">
          <button :disabled="annotation.from === null" @click="selectAnnotation(annotation)">
            Select
          </button>
          <button @click="editor.commands.deleteAnnotation(annotation.id)">Remove</button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { Editor } from '@tiptap/core'
import type { ResolvedAnnotation } from './extension/types/Annotation.js'

const props = defineProps<{ editor: Editor; annotations: ResolvedAnnotation[] }>()

function selectAnnotation(annotation: ResolvedAnnotation) {
  if (annotation.from === null) {
    return
  }

  if (annotation.kind === 'node') {
    props.editor.chain().focus().setNodeSelection(annotation.from).run()
    return
  }

  props.editor.chain().focus().setTextSelection({ from: annotation.from, to: annotation.to }).run()
}
</script>
