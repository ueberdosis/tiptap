<template>
  <div v-if="editor">
    <button @click="editor.chain().focus().toggleBulletList().run()" :class="{ 'is-active': editor.isActive('bulletList') }">
      toggleBulletList
    </button>
    <button @click="editor.chain().focus().splitListItem('listItem').run()" :disabled="!editor.can().splitListItem('listItem')">
      splitListItem
    </button>
    <button @click="editor.chain().focus().sinkListItem('listItem').run()" :disabled="!editor.can().sinkListItem('listItem')">
      sinkListItem
    </button>
    <button @click="editor.chain().focus().liftListItem('listItem').run()" :disabled="!editor.can().liftListItem('listItem')">
      liftListItem
    </button>

    <editor-content :editor="editor" />
  </div>
</template>

<script>
import { Editor, EditorContent } from '@tiptap/vue-3'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import BulletList from '@tiptap/extension-bullet-list'
import ListItem from '@tiptap/extension-list-item'

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
        BulletList,
        ListItem,
      ],
      content: `
        <ul>
          <li>A list item</li>
          <li>And another one</li>
        </ul>
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
