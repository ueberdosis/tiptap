<template>
  <div v-if="editor" class="container">
    <div class="control-group">
      <div class="button-group">
        <button @click="editor.chain().focus().toggleHighlight().run()" :class="{ 'is-active': editor.isActive('highlight') }">
          Toggle highlight
        </button>
        <button @click="editor.chain().focus().toggleHighlight({ color: '#ffc078' }).run()" :class="{ 'is-active': editor.isActive('highlight', { color: '#ffc078' }) }">
          Orange
        </button>
        <button @click="editor.chain().focus().toggleHighlight({ color: '#8ce99a' }).run()" :class="{ 'is-active': editor.isActive('highlight', { color: '#8ce99a' }) }">
          Green
        </button>
        <button @click="editor.chain().focus().toggleHighlight({ color: '#74c0fc' }).run()" :class="{ 'is-active': editor.isActive('highlight', { color: '#74c0fc' }) }">
          Blue
        </button>
        <button @click="editor.chain().focus().toggleHighlight({ color: '#b197fc' }).run()" :class="{ 'is-active': editor.isActive('highlight', { color: '#b197fc' }) }">
          Purple
        </button>
        <button @click="editor.chain().focus().toggleHighlight({ color: 'red' }).run()" :class="{ 'is-active': editor.isActive('highlight', { color: 'red' }) }">
          Red ('red')
        </button>
        <button @click="editor.chain().focus().toggleHighlight({ color: '#ffa8a8' }).run()" :class="{ 'is-active': editor.isActive('highlight', { color: '#ffa8a8' }) }">
          Red (#ffa8a8)
        </button>
        <button
          @click="editor.chain().focus().unsetHighlight().run()"
          :disabled="!editor.isActive('highlight')"
        >
          Unset highlight
        </button>
      </div>
    </div>
    <editor-content :editor="editor" />
  </div>
</template>

<script>
import Document from '@tiptap/extension-document'
import Highlight from '@tiptap/extension-highlight'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
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

  mounted() {
    this.editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        Highlight.configure({ multicolor: true }),
      ],
      content: `
        <p>This isn’t highlighted.</s></p>
        <p><mark>But that one is.</mark></p>
        <p><mark style="background-color: red;">And this is highlighted too, but in a different color.</mark></p>
        <p><mark data-color="#ffa8a8">And this one has a data attribute.</mark></p>
      `,
    })
  },

  beforeUnmount() {
    this.editor.destroy()
  },
}
</script>

<style lang="scss">
/* Basic editor styles */
.tiptap {
  :first-child {
    margin-top: 0;
  }

  mark {
    background-color: #FAF594;
    border-radius: 0.4rem;
    box-decoration-break: clone;
    padding: 0.1rem 0.3rem;
  }
}
</style>
