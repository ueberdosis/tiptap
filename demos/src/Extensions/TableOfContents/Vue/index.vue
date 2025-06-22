<template>
  <div class="col-group">
    <div class="main">
      <editor-content :editor="editor" />
    </div>
    <div class="sidebar">
      <div class="sidebar-options">
        <div class="label-large">Table of contents</div>
        <div class="table-of-contents">
          <template v-if="editor">
            <ToC :editor="editor" :items="items" />
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getHierarchicalIndexes, TableOfContents } from '@tiptap/extension-table-of-contents'
import StarterKit from '@tiptap/starter-kit'
import { Editor, EditorContent } from '@tiptap/vue-3'
import { defineComponent } from 'vue'

import { content as bookContent } from '../content.js'
import ToC from './ToC.vue'

export default defineComponent({
  components: {
    EditorContent,
    ToC,
  },

  data() {
    return {
      editor: null,
      items: [],
    }
  },

  mounted() {
    this.editor = new Editor({
      extensions: [
        StarterKit,
        TableOfContents.configure({
          getIndex: getHierarchicalIndexes,
          onUpdate: content => {
            this.items = content
          },
        }),
      ],
      content: bookContent,
    })
  },

  beforeUnmount() {
    this.editor.destroy()
  },
})
</script>

<style lang="scss">
/* Basic editor styles */
.tiptap {
  :first-child {
    margin-top: 0;
  }
}

.col-group {
  display: flex;
  flex-direction: row;

  @media (max-width: 540px) {
    flex-direction: column-reverse;
  }
}

.main {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: auto;
}

.sidebar {
  border-left: 1px solid var(--gray-3);
  flex-grow: 0;
  flex-shrink: 0;
  padding: 1rem;
  width: 15rem;
  position: sticky;
  height: 100vh;
  top: 0;

  @media (min-width: 800px) {
    width: 20rem;
  }

  @media (max-width: 540px) {
    border-bottom: 1px solid var(--gray-3);
    border-left: unset;
    width: 100%;
    height: auto;
    position: unset;
    padding: 1.5rem;
  }
}

.sidebar-options {
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 1rem;
  position: sticky;
  top: 1rem;
}

.table-of-contents {
  display: flex;
  flex-direction: column;
  font-size: 0.875rem;
  gap: 0.25rem;
  overflow: auto;
  text-decoration: none;

  > div {
    border-radius: 0.25rem;
    padding-left: calc(0.875rem * (var(--level) - 1));
    transition: all 0.2s cubic-bezier(0.65, 0.05, 0.36, 1);

    &:hover {
      background-color: var(--gray-2);
    }
  }

  .empty-state {
    color: var(--gray-5);
    user-select: none;
  }

  .is-active a {
    color: var(--purple);
  }

  .is-scrolled-over a {
    color: var(--gray-5);
  }

  a {
    color: var(--black);
    display: flex;
    gap: 0.25rem;
    text-decoration: none;

    &::before {
      content: attr(data-item-index) '.';
    }
  }
}
</style>
