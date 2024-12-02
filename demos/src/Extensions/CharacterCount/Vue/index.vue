<template>
  <div class="container" v-if="editor">
    <editor-content :editor="editor" />

    <div :class="{'character-count': true, 'character-count--warning': editor.storage.characterCount.characters() === limit}">
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
      <br>
      {{ editor.storage.characterCount.words() }} words
    </div>
  </div>
</template>

<script>
import CharacterCount from '@tiptap/extension-character-count'
import Document from '@tiptap/extension-document'
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
      ],
      content: `
        <p>
          Let‘s make sure people can’t write more than 280 characters. I bet you could build one of the biggest social networks on that idea.
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
