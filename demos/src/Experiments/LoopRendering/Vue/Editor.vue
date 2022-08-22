<template>
  <div class="grid" v-if="editor">
    <div class="label">Editor {{ title }}:</div>
    <div class="wrapper">
      <editor-content :editor="editor" />
    </div>
  </div>
</template>

<script>
import { Document } from '@tiptap/extension-document'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Text } from '@tiptap/extension-text'
import { Editor, EditorContent } from '@tiptap/vue-3'

const ParagraphDocument = Document.extend({
  content: 'paragraph',
})

export default {
  components: {
    EditorContent,
  },

  props: {
    title: {
      type: String,
      default: '',
    },
    content: {
      type: String,
      default: '<p>No matter what you do, this will be a single paragraph.</p>',
    },
  },

  data() {
    return {
      editor: null,
    }
  },

  mounted() {
    this.editor = new Editor({
      extensions: [
        ParagraphDocument,
        Paragraph,
        Text,
      ],
      content: '',
    })
  },

  beforeUnmount() {
    this.editor.destroy()
  },
}
</script>

<style lang="scss" scoped>
.grid {
  display: grid;
  grid-template-columns: 10rem 1fr;
  gap: 2rem;
}

.label {
  background: #f0f0f0;
  padding: 0.5rem;
}

.wrapper {
  border: 1px solid #f0f0f0;
}
</style>

<style lang="scss">
.ProseMirror {
  > * + * {
    margin-top: 0.75em;
  }

  p {
    margin: 0;
  }

  ul[data-type="taskList"] {
    list-style: none;
    padding: 0;

    li {
      display: flex;
      align-items: center;

      > label {
        flex: 0 0 auto;
        margin-right: 0.5rem;
        user-select: none;
      }

      > div {
        flex: 1 1 auto;
      }
    }
  }
}
</style>
