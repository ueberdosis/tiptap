<template>
  <div>
    <editor-content :editor="editor" />

    <div :class="{'character-limit': true, 'character-limit--warning': characters === limit}">
      {{ characters }}/{{ limit }} characters
    </div>
  </div>
</template>

<script>
import { Editor, EditorContent } from '@tiptap/vue-starter-kit'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import CharacterCount from '@tiptap/extension-character-count'

export default {
  components: {
    EditorContent,
  },

  data() {
    return {
      editor: null,
      limit: 280,
    }
  },

  mounted() {
    this.editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        CharacterCount.configure({
          limit: this.limit,
        }),
      ],
      content: `
        <p>
          Let‘s make sure people can’t write more than 280 characters. I bet you could build one of the biggest social networks on that idea.
        </p>
      `,
    })
  },

  computed: {
    characters() {
      if (this.editor) {
        return this.editor.state.doc.content.size - 2
      }

      return null
    },
  },

  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>

<style lang="scss">
/* Basic editor styles */
.ProseMirror {
  > * + * {
    margin-top: 0.75em;
  }
}

.character-limit {
  margin-top: 1rem;
  color: #868e96;

  &--warning {
    color: #f03e3e;
  }
}
</style>
