<template>
  <div>
    <div v-if="editor">
      <h2>
        Original
      </h2>
      <button @click="addComment" :disabled="!editor.can().addAnnotation()">
        comment
      </button>
      <editor-content :editor="editor" />
      <div v-for="comment in comments" :key="comment.type.spec.data.id">
        {{ comment.type.spec.data }}

        <button @click="deleteComment(comment.type.spec.data.id)">
          remove
        </button>
      </div>

      <!-- <br>
      <h2>
        ProseMirror JSON from Y.js document
      </h2>
      {{ rawDocument }} -->

      <br>
      <h2>
        Y.js document
      </h2>
      {{ json }}

      <br>
      <h2>
        Mirror
      </h2>
      <editor-content :editor="anotherEditor" />
    </div>
  </div>
</template>

<script>
import { Editor, EditorContent } from '@tiptap/vue-starter-kit'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Collaboration from '@tiptap/extension-collaboration'
import Bold from '@tiptap/extension-bold'
import Heading from '@tiptap/extension-heading'
import * as Y from 'yjs'
import { yDocToProsemirrorJSON } from 'y-prosemirror'
import Annotation from '../Annotation/extension'

export default {
  components: {
    EditorContent,
  },

  data() {
    return {
      editor: null,
      anotherEditor: null,
      comments: [],
      ydoc: null,
    }
  },

  mounted() {
    this.ydoc = new Y.Doc()

    this.editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        Bold,
        Heading,
        Annotation.configure({
          onUpdate: items => { this.comments = items },
        }),
        Collaboration.configure({
          document: this.ydoc,
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
        // Annotation.configure({
        //   onUpdate: items => { this.comments = items },
        // }),
        Collaboration.configure({
          document: this.ydoc,
        }),
      ],
    })
  },

  methods: {
    addComment() {
      const content = prompt('Comment', '')

      this.editor.commands.addAnnotation(content)
    },
    deleteComment(id) {
      this.editor.commands.deleteAnnotation(id)
    },
  },

  computed: {
    rawDocument() {
      return yDocToProsemirrorJSON(this.ydoc, 'default')
    },
    json() {
      return this.ydoc.toJSON()
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
