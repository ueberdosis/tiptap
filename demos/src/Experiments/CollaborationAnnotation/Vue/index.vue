<template>
  <div>
    <div v-if="editor">
      <h2>
        Original Editor
      </h2>
      <button @click="addComment" :disabled="!editor.can().addAnnotation()">
        comment
      </button>
      <editor-content class="editor-1" :editor="editor" />
      <div class="comment" v-for="comment in comments" :key="comment.id">
        {{ comment }}

        <button @click="updateComment(comment.id)">
          update
        </button>

        <button @click="deleteComment(comment.id)">
          remove
        </button>
      </div>

      <h2>
        Another Editor
      </h2>
      <button @click="addAnotherComment" :disabled="!anotherEditor.can().addAnnotation()">
        comment
      </button>
      <editor-content class="editor-2" :editor="anotherEditor" />
    </div>
  </div>
</template>

<script>
import Bold from '@tiptap/extension-bold'
import Collaboration from '@tiptap/extension-collaboration'
import Document from '@tiptap/extension-document'
import Heading from '@tiptap/extension-heading'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { Editor, EditorContent } from '@tiptap/vue-3'
import * as Y from 'yjs'

import CollaborationAnnotation from './extension'

export default {
  components: {
    EditorContent,
  },

  data() {
    return {
      editor: null,
      anotherEditor: null,
      comments: [],
    }
  },

  mounted() {
    const ydoc = new Y.Doc()

    this.editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        Bold,
        Heading,
        CollaborationAnnotation.configure({
          document: ydoc,
          onUpdate: items => { this.comments = items },
          instance: 'editor1',
        }),
        Collaboration.configure({
          document: ydoc,
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

    this.anotherEditor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        Bold,
        Heading,
        CollaborationAnnotation.configure({
          document: ydoc,
          instance: 'editor2',
        }),
        Collaboration.configure({
          document: ydoc,
        }),
      ],
    })
  },

  methods: {
    addComment() {
      const data = prompt('Comment', '')

      this.editor.commands.addAnnotation(data)
    },
    updateComment(id) {
      const comment = this.comments.find(item => {
        return id === item.id
      })

      const data = prompt('Comment', comment.data)

      this.editor.commands.updateAnnotation(id, data)
    },
    deleteComment(id) {
      this.editor.commands.deleteAnnotation(id)
    },
    addAnotherComment() {
      const data = prompt('Comment', '')

      this.anotherEditor.commands.addAnnotation(data)
    },
  },

  beforeUnmount() {
    this.editor.destroy()
    this.anotherEditor.destroy()
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
