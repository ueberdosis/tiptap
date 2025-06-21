<template>
  <div v-if="editor" class="container">
    <div class="control-group">
      <div class="button-group">
        <button @click="addImage">Set image</button>
      </div>
    </div>
    <editor-content :editor="editor" />
  </div>
</template>

<script>
import Document from '@tiptap/extension-document'
import Image from '@tiptap/extension-image'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { Dropcursor } from '@tiptap/extensions'
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

  methods: {
    addImage() {
      const url = window.prompt('URL')

      if (url) {
        this.editor.chain().focus().setImage({ src: url }).run()
      }
    },
  },

  mounted() {
    this.editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        Image.configure({ resize: { minWidth: 100, minHeight: 100 } }),
        Dropcursor,
      ],
      content: `
        <p>This is a basic example of implementing images. Drag to re-order.</p>
        <img src="https://unsplash.it/seed/tiptap/800/400" />
        <img src="https://unsplash.it/seed/tiptap-2/800/400" />
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

  img {
    display: block;
  }

  [data-resize-container] {
    &.ProseMirror-selectednode {
      background-color: var(--purple-light);
    }
  }

  [data-resize-container] img {
    max-width: 100%;
  }

  [data-resize-container][data-node='image'] {
    margin: 1.5rem 0;
    max-width: 100%;
  }

  [data-resize-handle][data-edge] {
    background-color: var(--purple);
    opacity: 0.8;
    transition: opacity 0.2s ease-in-out;

    &:hover {
      opacity: 1;
    }

    &[data-orientation='horizontal'] {
      width: 4px;
    }

    &[data-orientation='vertical'] {
      height: 4px;
    }
  }

  [data-resize-handle][data-corner] {
    background-color: var(--white);
    width: 10px;
    height: 10px;
    border: 2px solid var(--purple);
  }

  [data-corner='top-left'] {
    transform: translate(-50%, -50%);
  }

  [data-corner='top-right'] {
    transform: translate(50%, -50%);
  }

  [data-corner='bottom-left'] {
    transform: translate(-50%, 50%);
  }

  [data-corner='bottom-right'] {
    transform: translate(50%, 50%);
  }
}
</style>
