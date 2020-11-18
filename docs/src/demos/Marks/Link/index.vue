<template>
  <div v-if="editor">
    <button @click="addLink" :class="{ 'is-active': editor.isActive('link') }">
      link
    </button>
    <button @click="editor.chain().focus().removeLink().run()" v-if="editor.isActive('link')">
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
        Document,
        Paragraph,
        Text,
        Link,
      ],
      content: `
        <p>
          Wow, this editor has support for links to the whole <a href="https://en.wikipedia.org/wiki/World_Wide_Web">world wide web</a>. We tested a lot of URLs and I think you can add *every URL* you want. Isn’t that cool? Let’s try <a href="https://statamic.com/">another one!</a> Yep, seems to work.
        </p>
        <p>
          By default every link will get a \`rel="noopener noreferrer nofollow"\` attribute. It’s configurable though.
        </p>
      `,
    })
  },

  methods: {
    addLink() {
      const url = window.prompt('URL')

      this.editor.chain().focus().addLink({ href: url }).run()
    },
  },

  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>
