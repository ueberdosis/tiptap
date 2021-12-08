<template>
  <div>
    <editor-content :editor="editor" />

    <div v-if="editor" :class="{'character-count': true, 'character-count--warning': editor.storage.characterCount.characters() === limit}">
      <svg
        height="20"
        width="20"
        viewBox="0 0 20 20"
        class="character-count__graph"
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

      <div class="character-count__text">
        {{ editor.storage.characterCount.characters() }}/{{ limit }} characters
      </div>
    </div>
  </div>
</template>

<script>
import { Editor, EditorContent } from '@tiptap/vue-3'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import CharacterCount from '@tiptap/extension-character-count'
import Mention from '@tiptap/extension-mention'
import suggestion from './suggestion'

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
.ProseMirror {
  > * + * {
    margin-top: 0.75em;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    line-height: 1.1;
  }
}

.mention {
  border: 1px solid #000;
  border-radius: 0.4rem;
  padding: 0.1rem 0.3rem;
  box-decoration-break: clone;
}

.character-count {
  margin-top: 1rem;
  display: flex;
  align-items: center;
  color: #68CEF8;

  &--warning {
    color: #FB5151;
  }

  &__graph {
    margin-right: 0.5rem;
  }

  &__text {
    color: #868e96;
  }
}
</style>
