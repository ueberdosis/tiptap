<template>
  <div v-if="editor" class="container">
    <div class="control-group">
      <div class="button-group">
        <button @click="editor.chain().focus().setDetails().run()" :disabled="!editor.can().setDetails()">
          Set details
        </button>
        <button @click="editor.chain().focus().unsetDetails().run()" :disabled="!editor.can().unsetDetails()">
          Unset details
        </button>
      </div>
    </div>
  </div>
  <editor-content :editor="editor" />
</template>

<script>
import Details from '@tiptap/extension-details'
import DetailsContent from '@tiptap/extension-details-content'
import DetailsSummary from '@tiptap/extension-details-summary'
import Placeholder from '@tiptap/extension-placeholder'
import StarterKit from '@tiptap/starter-kit'
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

  mounted() {
    this.editor = new Editor({
      extensions: [
        StarterKit,
        Details.configure({
          persist: true,
          HTMLAttributes: {
            class: 'details',
          },
        }),
        DetailsSummary,
        DetailsContent,
        Placeholder.configure({
          includeChildren: true,
          placeholder: ({ node }) => {
            if (node.type.name === 'detailsSummary') {
              return 'Summary'
            }

            return null
          },
        }),
      ],
      content: `
        <p>Look at these details</p>
        <details>
          <summary>This is a summary</summary>
          <p>Surprise!</p>
        </details>
        <p>Nested details are also supported</p>
        <details open>
          <summary>This is another summary</summary>
          <p>And there is even more.</p>
          <details>
            <summary>We need to go deeper</summary>
            <p>Booya!</p>
          </details>
        </details>
      `,
    })
  },

  beforeUnmount() {
    this.editor.destroy()
  },
}
</script>

<style lang="scss">/* Basic editor styles */
.tiptap {
  :first-child {
    margin-top: 0;
  }

  /* Details */
  .details {
    display: flex;
    gap: 0.25rem;
    margin: 1.5rem 0;
    border: 1px solid var(--gray-3);
    border-radius: 0.5rem;
    padding: 0.5rem;

    summary {
      font-weight: 700;
    }

    > button {
      align-items: center;
      background: transparent;
      border-radius: 4px;
      display: flex;
      font-size: 0.625rem;
      height: 1.25rem;
      justify-content: center;
      line-height: 1;
      margin-top: 0.1rem;
      padding: 0;
      width: 1.25rem;

      &:hover {
        background-color: var(--gray-3);
      }

      &::before {
        content: '\25B6';
      }

    }

    &.is-open > button::before {
      transform: rotate(90deg);
    }

    > div {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      width: 100%;

      > [data-type="detailsContent"] > :last-child {
        margin-bottom: 0.5rem;
      }
    }

    .details {
      margin: 0.5rem 0;
    }
  }
}
</style>
