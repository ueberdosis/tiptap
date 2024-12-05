<template>
  <editor-content :editor="editor" />

  <div v-if="editor" :class="{'character-count': true, 'character-count--warning': editor.storage.characterCount.characters() === limit}">
    <svg
      height="20"
      width="20"
      viewBox="0 0 20 20"
    >
      <circle
        r="10"
        cx="10"
        cy="10"
        fill="#e9ecef"
      />
      <circle
        r="5"
        cx="10"
        cy="10"
        fill="transparent"
        stroke="currentColor"
        stroke-width="10"
        :stroke-dasharray="`calc(${percentage} * 31.4 / 100) 31.4`"
        transform="rotate(-90) translate(-20)"
      />
      <circle
        r="6"
        cx="10"
        cy="10"
        fill="white"
      />
    </svg>

    {{ editor.storage.characterCount.characters() }} / {{ limit }} characters
  </div>
</template>

<script>
import CharacterCount from '@tiptap/extension-character-count'
import Document from '@tiptap/extension-document'
import Mention from '@tiptap/extension-mention'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { Editor, EditorContent } from '@tiptap/vue-3'

import suggestion from './suggestion.js'

export default {
  components: {
    EditorContent,
  },

  data() {
    return {
      editor: null,
      limit: 280,
    }
  },

  mounted() {
    this.editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        CharacterCount.configure({
          limit: this.limit,
        }),
        Mention.configure({
          HTMLAttributes: {
            class: 'mention',
          },
          suggestion,
        }),
      ],
      content: `
        <p>
          What do you all think about the new <span data-type="mention" data-id="Winona Ryder"></span> movie?
        </p>
      `,
    })
  },

  computed: {
    percentage() {
      return Math.round((100 / this.limit) * this.editor.storage.characterCount.characters())
    },
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

  .mention {
    background-color: var(--purple-light);
    border-radius: 0.4rem;
    box-decoration-break: clone;
    color: var(--purple);
    padding: 0.1rem 0.3rem;
  }
}

/* Character count */
.character-count {
  align-items: center;
  color: var(--gray-5);
  display: flex;
  font-size: 0.75rem;
  gap: .5rem;
  margin: 1.5rem;

  svg {
    color: var(--purple);
  }

  &--warning,
  &--warning svg {
    color: var(--red);
  }
}
</style>
