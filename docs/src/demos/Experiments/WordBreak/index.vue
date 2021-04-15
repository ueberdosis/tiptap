<template>
  <div v-if="editor">
    <button @click="editor.chain().focus().setWordBreak().run()" :class="{ 'is-active': editor.isActive('wordBreak') }">
      wbr
    </button>

    <editor-content :editor="editor" />

    <h2>HTML</h2>
    {{ editor.getHTML() }}
  </div>
</template>

<script>
import { Editor, EditorContent } from '@tiptap/vue-2'
import { defaultExtensions } from '@tiptap/starter-kit'
import { WordBreak } from './word-break'

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
        ...defaultExtensions(),
        WordBreak,
      ],
      content: `
        <p>super<wbr>longword</p>
      `,
    })
  },

  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>

<style lang="scss" scoped>
::v-deep {
  .ProseMirror {
    > * + * {
      margin-top: 0.75em;
    }
  }

  .word-break {
    display: inline-block;
    height: 1em;
    margin: 0 0.1em;
    line-height: 1em;
    border: 1px dashed #868e96;
    color: #868e96;

    &::before {
      content: '-';
    }
  }
}
</style>
