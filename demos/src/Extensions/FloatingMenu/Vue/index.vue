<template>
  <div>
    <div>
      <input type="checkbox" :checked="isEditable" @change="() => isEditable = !isEditable">
      Editable
    </div>
    <floating-menu :editor="editor" :tippy-options="{ duration: 100 }" v-if="editor">
      <button @click="editor.chain().focus().toggleHeading({ level: 1 }).run()" :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }">
        H1
      </button>
      <button @click="editor.chain().focus().toggleHeading({ level: 2 }).run()" :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }">
        H2
      </button>
      <button @click="editor.chain().focus().toggleBulletList().run()" :class="{ 'is-active': editor.isActive('bulletList') }">
        Bullet List
      </button>
    </floating-menu>
    <editor-content :editor="editor" />
  </div>
</template>

<script>
import StarterKit from '@tiptap/starter-kit'
import { Editor, EditorContent, FloatingMenu } from '@tiptap/vue-3'

export default {
  components: {
    EditorContent,
    FloatingMenu,
  },

  data() {
    return {
      editor: null,
      isEditable: true,
    }
  },

  watch: {
    isEditable(value) {
      this.editor.setEditable(value)
    },
  },

  mounted() {
    this.editor = new Editor({
      extensions: [
        StarterKit,
      ],
      content: `
        <p>
          This is an example of a Medium-like editor. Enter a new line and some buttons will appear.
        </p>
        <p></p>
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
.ProseMirror {
  > * + * {
    margin-top: 0.75em;
  }

  ul,
  ol {
    padding: 0 1rem;
  }
}
</style>
