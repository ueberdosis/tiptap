<template>
  <div v-if="editor" class="container">
    <div class="control-group">
      <div class="button-group">
        <button @click="addFigure">
          Add image with caption
        </button>
        <button
          @click="editor.chain().focus().imageToFigure().run()"
          :disabled="!editor.can().imageToFigure()"
        >
          Add caption to image
        </button>
        <button
          @click="editor.chain().focus().figureToImage().run()"
          :disabled="!editor.can().figureToImage()"
        >
          Remove caption from image
        </button>
      </div>
    </div>
    <editor-content :editor="editor" />

    <div class="output-group">
      <label>HTML</label>
      <code>{{ editor.getHTML() }}</code>
    </div>
  </div>
</template>

<script>
import Image from '@tiptap/extension-image'
import StarterKit from '@tiptap/starter-kit'
import { Editor, EditorContent } from '@tiptap/vue-3'

import { Figure } from './figure.ts'

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
    addFigure() {
      const url = window.prompt('URL')
      const caption = window.prompt('caption')

      if (url) {
        this.editor
          .chain()
          .focus()
          .setFigure({ src: url, caption })
          .run()
      }
    },
  },

  mounted() {
    this.editor = new Editor({
      extensions: [
        StarterKit,
        Figure,
        Image,
      ],
      content: `
        <p>Figure + Figcaption</p>
        <figure>
          <img src="https://placehold.co/800x400/orange/white" alt="Random photo of something" title="Who’s dat?">
          <figcaption>
            <p>Amazing caption</p>
          </figcaption>
        </figure>
        <img src="https://placehold.co/800x400/green/white">
        <img src="https://placehold.co/800x400/blue/white">
        <img src="https://placehold.co/800x400/black/white">
        <p>That’s it.</p>
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

  /* List styles */
  ul,
  ol {
    padding: 0 1rem;
    margin: 1.25rem 1rem 1.25rem 0.4rem;

    li p {
      margin-top: 0.25em;
      margin-bottom: 0.25em;
    }
  }

  /* Heading styles */
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    line-height: 1.1;
    margin-top: 2.5rem;
    text-wrap: pretty;
  }

  h1,
  h2 {
    margin-top: 3.5rem;
    margin-bottom: 1.5rem;
  }

  h1 {
    font-size: 1.4rem;
  }

  h2 {
    font-size: 1.2rem;
  }

  h3 {
    font-size: 1.1rem;
  }

  h4,
  h5,
  h6 {
    font-size: 1rem;
  }

  /* Code and preformatted text styles */
  code {
    background-color: var(--purple-light);
    border-radius: 0.4rem;
    color: var(--black);
    font-size: 0.85rem;
    padding: 0.25em 0.3em;
  }

  pre {
    background: var(--black);
    border-radius: 0.5rem;
    color: var(--white);
    font-family: 'JetBrainsMono', monospace;
    margin: 1.5rem 0;
    padding: 0.75rem 1rem;

    code {
      background: none;
      color: inherit;
      font-size: 0.8rem;
      padding: 0;
    }
  }

  blockquote {
    border-left: 3px solid var(--gray-3);
    margin: 1.5rem 0;
    padding-left: 1rem;
  }

  hr {
    border: none;
    border-top: 1px solid var(--gray-2);
    margin: 2rem 0;
  }

  img {
    display: block;
    height: auto;
    margin: 1.5rem 0;
    max-width: 100%;

    &.ProseMirror-selectednode {
      outline: 3px solid var(--purple);
    }
  }

  /* Figure */
  figure {
    align-items: start;
    border: 2px solid var(--black);
    border-radius: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin: 1rem 0;
    padding: 0.5rem;
    width: fit-content;

    > *:not(figcaption) {
      margin: 0;
      max-width: 100%;
    }

    &:has(figcaption:active) {
      border-color: var(--purple);
    }

    figcaption {
      border-radius: 0.5rem;
      border: 2px dashed #0D0D0D20;
      padding: 0.5rem;
      text-align: center;
      width: 100%;
    }
  }
}
</style>
