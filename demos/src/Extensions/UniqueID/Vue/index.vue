<template>
  <editor-content :editor="editor" />
</template>

<script>
import Document from '@dibdab/extension-document'
import Heading from '@dibdab/extension-heading'
import Paragraph from '@dibdab/extension-paragraph'
import Text from '@dibdab/extension-text'
import UniqueID from '@dibdab/extension-unique-id'
import { Editor, EditorContent } from '@dibdab/vue-3'
import { defineComponent } from 'vue'

export default defineComponent({
  components: {
    EditorContent,
  },

  data() {
    return {
      editor: null,
    }
  },

  mounted() {
    this.editor = new Editor({
      extensions: [
        Document,
        Heading,
        Paragraph,
        Text,
        UniqueID.configure({
          types: ['heading', 'paragraph'],
        }),
      ],
      content: `
        <h1>
          This is a very unique heading.
        </h1>
        <p>
          This is a unique paragraph. It’s so unique, it even has an ID attached to it.
        </p>
        <p>
          And this one, too.
        </p>
      `,
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

  /* Unique data id */
  [data-id] {
    border: 2px solid var(--black);
    border-radius: 0.5rem;
    padding: 2.5rem 1rem 1rem;
    position: relative;

    &::before {
      background-color: var(--black);
      border-radius: 0 0 0.5rem 0;
      color: var(--white);
      content: attr(data-id);
      font-size: 0.75rem;
      font-weight: bold;
      left: 0;
      line-height: 1.5;
      padding: 0.25rem 0.5rem;
      position: absolute;
      top: 0;
    }
  }
}
</style>
