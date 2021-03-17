<template>
  <editor-content :editor="editor" />
</template>

<script>
import { Editor, EditorContent } from '@tiptap/vue-2'
import { defaultExtensions } from '@tiptap/starter-kit'
import VueComponent from './index.js'

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
        VueComponent,
      ],
      content: `
        <p>
          This is still the text editor you’re used to, but enriched with node views.
        </p>
        <node-view count="0"></node-view>
        <p>
          Did you see that? That’s a JavaScript node view. We are really living in the future.
        </p>
      `,
    })
  },

  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>

<style lang="scss" scoped>
/* Basic editor styles */
.ProseMirror {
  > * + * {
    margin-top: 0.75em;
  }
}

::v-deep {
  .node-view {
    border: 1px solid #adb5bd;
    border-radius: 0.5rem;
    margin: 1rem 0;
    position: relative;
  }

  .label {
    margin-left: 1rem;
    background-color: #adb5bd;
    font-size: 0.6rem;
    letter-spacing: 1px;
    font-weight: bold;
    text-transform: uppercase;
    color: #fff;
    position: absolute;
    top: 0;
    padding: 0.25rem 0.75rem;
    border-radius: 0 0 0.5rem 0.5rem;
  }

  .content {
    margin: 2.5rem 1rem 1rem;
  }
}
</style>
