<template>
  <div class="editor">
    <div class="checkbox">
      <input type="checkbox" id="editable" v-model="editable">
      <label for="editable">editable</label>
    </div>
    <editor-content :editor="editor" />
  </div>
</template>

<script>
import { Editor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'

export default {
  components: {
    EditorContent,
  },

  data() {
    return {
      editor: null,
      editable: false,
    }
  },

  mounted() {
    this.editor = new Editor({
      editable: this.editable,
      content: `
        <p>
          This text is <strong>read-only</strong>. No matter what you try, you are not able to edit something. Okay, if you toggle the checkbox above you’ll be able to edit the text.
        </p>
        <p>
          If you want to check the state, you can call <code>editor.isEditable()</code>.
        </p>
      `,
      extensions: [
        StarterKit,
      ],
    })
  },

  watch: {
    editable() {
      this.editor.setEditable(this.editable)
    },
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

.checkbox {
  margin-bottom: 1rem;

  input[type="checkbox"] {
    margin-right: 0.5rem;
  }
}

[contenteditable=false] {
  color: #999;
  cursor: not-allowed;
}
</style>
