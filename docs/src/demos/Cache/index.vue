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
import ParagraphComponent from './ParagraphComponent.vue'
import Dropcursor from '@tiptap/extension-dropcursor'

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
        Dropcursor,
        Document,
        Paragraph.extend({
          draggable: true,
          addNodeView() {
            return VueNodeViewRenderer(ParagraphComponent)
          },
        }),
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
      // content: `
      //   <p>
      //     text
      //   </p>
      //   <p>
      //     text <img src="#" /> text
      //   </p>
      //   <p>
      //     text
      //   </p>
      // `,
      content: `
        <p>
          text
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

  p {
    padding-left: 2rem;
  }
}
</style>
