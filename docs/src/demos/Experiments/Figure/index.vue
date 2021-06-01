<template>
  <div v-if="editor">
    <editor-content :editor="editor" />

    <h2>HTML</h2>
    {{ editor.getHTML() }}
  </div>
</template>

<script>
import { Editor, EditorContent } from '@tiptap/vue-2'
import StarterKit from '@tiptap/starter-kit'
import { Figure } from './figure'

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
        StarterKit,
        Figure,
      ],
      content: `
        <p>Figure + Figcaption</p>
        <figure>
          <img src="https://source.unsplash.com/8xznAGy4HcY/800x400" alt="Random photo of something" title="Who’s dat?">
          <figcaption>
            <p>Amazing caption</p>
          </figcaption>
        </figure>
        <p>That’s it.</p>
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

    figure {
      max-width: 25rem;
      border: 3px solid #0D0D0D;
      border-radius: 0.5rem;
      margin: 1rem 0;
      padding: 0.5rem;
    }

    figcaption {
      margin-top: 0.25rem;
      text-align: center;
      padding: 0.5rem;
      border: 2px dashed #0D0D0D20;
      border-radius: 0.5rem;
    }

    img {
      max-width: 100%;
      height: auto;
      border-radius: 0.5rem;
    }
  }
}
</style>
