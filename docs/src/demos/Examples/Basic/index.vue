<template>
  <div>
    <div v-if="editor">
      <button @click="editor.focus().removeMarks()">
        clear format
      </button>
      <button @click="editor.focus().bold()" :class="{ 'is-active': editor.isActive('bold') }">
        bold
      </button>
      <button @click="editor.focus().italic()" :class="{ 'is-active': editor.isActive('italic') }">
        italic
      </button>
      <button @click="editor.focus().code()" :class="{ 'is-active': editor.isActive('code') }">
        code
      </button>
      <button @click="editor.focus().codeBlock()" :class="{ 'is-active': editor.isActive('code_block') }">
        code_block
      </button>
      <button @click="editor.focus().heading({ level: 1 })" :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }">
        h1
      </button>
      <button @click="editor.focus().heading({ level: 2 })" :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }">
        h2
      </button>
      <button @click="editor.focus().heading({ level: 3 })" :class="{ 'is-active': editor.isActive('heading', { level: 3 }) }">
        h3
      </button>
      <button @click="editor.focus().heading({ level: 4 })" :class="{ 'is-active': editor.isActive('heading', { level: 4 }) }">
        h4
      </button>
      <button @click="editor.focus().heading({ level: 5 })" :class="{ 'is-active': editor.isActive('heading', { level: 5 }) }">
        h5
      </button>
      <button @click="editor.focus().heading({ level: 6 })" :class="{ 'is-active': editor.isActive('heading', { level: 6 }) }">
        h6
      </button>
      <button @click="editor.focus().undo()">
        undo
      </button>
      <button @click="editor.focus().redo()">
        redo
      </button>
    </div>
    <editor-content :editor="editor" />
  </div>
</template>

<script>
import { Editor, EditorContent, defaultExtensions } from '@tiptap/vue-starter-kit'

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
      content: `
        <h2>Hey there!</h2>
        <p>This editor is based on Prosemirror, fully extendable and renderless. You can easily add custom nodes as Vue components.</p>
      `,
      extensions: defaultExtensions(),
    })

    window.editor = this.editor
  },

  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>