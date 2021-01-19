<template>
  <div>
    <div v-if="editor">
      <button @click="addAnnotation" :disabled="!editor.can().addAnnotation()">
        add annotation
      </button>
      <editor-content :editor="editor" />
      <div v-for="comment in comments" :key="comment.type.spec.data.id">
        {{ comment.type.spec.data }}

        <button @click="deleteAnnotation(comment.type.spec.data.id)">
          remove
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { Editor, EditorContent } from '@tiptap/vue-starter-kit'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Annotation from './extension'

export default {
  components: {
    EditorContent,
  },

  data() {
    return {
      editor: null,
      comments: [],
    }
  },

  mounted() {
    this.editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        Annotation.configure({
          onUpdate: items => { this.comments = items },
        }),
      ],
      content: `
        <p>
          Annotations can be used to add additional information to the content, for example comments. They live on a different level than the actual editor content.
        </p>
        <p>
          This example allows you to add plain text, but you’re free to add more complex data, for example JSON from another tiptap instance. :-)
        </p>
      `,
    })
  },

  methods: {
    addAnnotation() {
      const content = prompt('Annotation', '')

      this.editor.commands.addAnnotation(content)
    },
    deleteAnnotation(id) {
      this.editor.commands.deleteAnnotation(id)
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

.annotation {
  background: #9DEF8F;
}
</style>
