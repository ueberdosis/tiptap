<template>
  <editor-content :editor="editor" />
</template>

<script>
import { Editor, EditorContent, VueNodeViewRenderer } from '@tiptap/vue-2'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Image from '@tiptap/extension-image'
import History from '@tiptap/extension-history'
import ImageComponent from './ImageComponent.vue'

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
        History,
        Image.extend({
          inline: true,
          group: 'inline',
          addNodeView() {
            return VueNodeViewRenderer(ImageComponent)
          },
        }),
      ],
      content: `
        <p>
          text
        </p>
        <p>
          text <img src="#" /> text
        </p>
      `,
    })
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
</style>
