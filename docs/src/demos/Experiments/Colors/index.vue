<template>
  <div>
    <editor-content :editor="editor" />
  </div>
</template>

<script>
import { Editor, EditorContent } from '@tiptap/vue-starter-kit'
import Document from '@tiptap/extension-document'
import Text from '@tiptap/extension-text'
import Paragraph from '@tiptap/extension-paragraph'
import Heading from '@tiptap/extension-heading'
import Colors from './extension'

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
        Heading,
        Text,
        Colors,
      ],
      content: `
        <p>
          For triplets with repeated values, you can eliminate the repetition by writing in shorthand, for instance, #00FFFF becomes #0FF. This system is easy for computers to understand, and it pretty short to write, which makes it useful for quick copy paste and designation in programming. If you’re going to work with colors in a more involved way, though, HSL is a little bit more human-readable. rgba(128, 128, 128, 0.3) foo
        </ul>
      `,
    })
  },

  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>

<style lang="scss">
.color {
  &::before {
    content: ' ';
    display: inline-block;
    width: 1em;
    height: 1em;
    border: 1px solid rgba(128, 128, 128, 0.3);
    vertical-align: middle;
    margin-right: 0.1em;
    margin-bottom: 0.15em;
    border-radius: 2px;
    background-color: var(--color);
  }
}

.ProseMirror {
  padding-right: 20px;
}
</style>
