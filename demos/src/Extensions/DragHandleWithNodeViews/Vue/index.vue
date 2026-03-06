<template>
  <drag-handle v-if="editor" :editor="editor">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
    </svg>
  </drag-handle>
  <editor-content :editor="editor" />
</template>

<script>
import { DragHandle } from '@tiptap/extension-drag-handle-vue-3'
import StarterKit from '@tiptap/starter-kit'
import { Editor, EditorContent } from '@tiptap/vue-3'

import { Recommendation } from './extensions/recommendation/Recommendation.js'

export default {
  components: {
    EditorContent,
    DragHandle,
  },

  data() {
    return {
      editor: null,
    }
  },

  mounted() {
    this.editor = new Editor({
      extensions: [StarterKit, Recommendation],
      content: `
        <h1>
          Drag to reorder — watch the position update instantly
        </h1>
        <p>
          Drag any recommendation block below to a new position. The <code>pos:</code> value should update immediately.
        </p>
        <div class="node-recommendation" data-id="1"></div>
        <div class="node-recommendation" data-id="2"></div>
        <div class="node-recommendation" data-id="3"></div>
        <div class="node-recommendation" data-id="4"></div>
        <div class="node-recommendation" data-id="5"></div>
      `,
    })
  },

  beforeUnmount() {
    this.editor?.destroy()
  },
}
</script>

<style lang="scss">
.ProseMirror {
  padding-inline: 4rem;

  > * + * {
    margin-top: 0.75em;
  }

  [data-id] {
    border: 3px solid #0d0d0d;
    border-radius: 0.5rem;
    margin: 1rem 0;
    position: relative;
    margin-top: 1.5rem;
    padding: 2rem 1rem 1rem;

    &::before {
      content: attr(data-id);
      background-color: #0d0d0d;
      font-size: 0.6rem;
      letter-spacing: 1px;
      font-weight: bold;
      text-transform: uppercase;
      color: #fff;
      position: absolute;
      top: 0;
      padding: 0.25rem 0.75rem;
      border-radius: 0 0 0.5rem 0.5rem;
    }
  }
}

.drag-handle {
  align-items: center;
  background: #f0f0f0;
  border-radius: 0.25rem;
  border: 1px solid rgba(0, 0, 0, 0.1);
  cursor: grab;
  display: flex;
  height: 1.5rem;
  justify-content: center;
  width: 1.5rem;

  svg {
    width: 1.25rem;
    height: 1.25rem;
  }
}

.node-recommendation {
  padding: 0.5rem;
  border-radius: 0.5rem;
  border: 0.15rem solid #000;

  .title {
    font-size: 0.875rem;
    color: #777;
  }

  p {
    margin: 0;
  }
}
</style>
