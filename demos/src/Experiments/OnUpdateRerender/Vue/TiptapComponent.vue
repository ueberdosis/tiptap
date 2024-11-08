<template>
  <div v-if="editor">
    <editor-content :editor="editor" />
  </div>
</template>

<script>
import StarterKit from '@tiptap/starter-kit'
import { Editor, EditorContent } from '@tiptap/vue-3'

export default {
  components: {
    EditorContent,
  },

  data() {
    return {
      editor: null,
    }
  },

  props: {
    count: {
      type: Number,
      required: true,
    },
  },

  mounted() {
    this.editor = new Editor({
      extensions: [
        StarterKit,
      ],
      content: `
        <p>
          This is a radically reduced version of Tiptap. It has support for a document, with paragraphs and text. That’s it. It’s probably too much for real minimalists though.
        </p>
        <p>
          The paragraph extension is not really required, but you need at least one node. Sure, that node can be something different.
        </p>
      `,
      onUpdate: ({ editor: currentEditor }) => {
        console.log(this.count, 'onUpdate', currentEditor.getHTML()) // eslint-disable-line no-console
      },
    })
  },

  unmounted() {
    this.editor.destroy()
  },
}
</script>
