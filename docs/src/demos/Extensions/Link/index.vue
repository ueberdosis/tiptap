<template>
  <div v-if="editor">
    <button @click="addLink" :class="{ 'is-active': editor.isActive('link') }">
      link
    </button>
    <button @click="editor.chain().focus().removeMark('link').run()" v-if="editor.isActive('link')">
      remove
    </button>
    <editor-content :editor="editor" />
  </div>
</template>

<script>
import { Editor } from '@tiptap/core'
import { EditorContent } from '@tiptap/vue'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Link from '@tiptap/extension-link'

export default {
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
        Document(),
        Paragraph(),
        Text(),
        Link(),
      ],
      content: `
        <p>
          Try to add some links to the <a href="https://en.wikipedia.org/wiki/World_Wide_Web" target="_self">world wide web</a>. By default every link will get a <code>rel="noopener noreferrer nofollow"</code> attribute.
        </p>
      `,
    })
  },

  methods: {
    addLink() {
      const url = window.prompt('URL')

      this.editor.chain().focus().link({ href: url }).run()
    },
  },

  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>
