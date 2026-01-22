<template>
  <div v-if="editor">
    <editor-content :editor="editor" />
  </div>
</template>

<script>
import Document from '@dibdab/extension-document'
import Mention from '@dibdab/extension-mention'
import Paragraph from '@dibdab/extension-paragraph'
import Text from '@dibdab/extension-text'
import { Editor, EditorContent } from '@dibdab/vue-3'

import suggestions from './suggestions.js'

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
        Mention.configure({
          HTMLAttributes: {
            class: 'mention',
          },
          suggestions,
        }),
      ],
      content: `
        <p>Hi everyone! Don’t forget the daily stand up at 8 AM.</p>
        <p>We will talk about the movies: <span data-type="mention" data-id="Dirty Dancing" data-mention-suggestion-char="#"></span>, <span data-type="mention" data-id="Pirates of the Caribbean" data-mention-suggestion-char="#"></span> and <span data-type="mention" data-id="The Matrix" data-mention-suggestion-char="#"></span>.</p>
        <p><span data-type="mention" data-id="Jennifer Grey"></span> Would you mind to share what you’ve been working on lately? We fear not much happened since <span data-type="mention" data-id="Dirty Dancing" data-mention-suggestion-char="#"></span>.</p>
        <p><span data-type="mention" data-id="Winona Ryder"></span> <span data-type="mention" data-id="Axl Rose"></span> Let’s go through your most important points quickly.</p>
        <p>I have a meeting with <span data-type="mention" data-id="Christina Applegate"></span> and don’t want to come late.</p>
        <p>– Thanks, your big boss</p>
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

  .mention {
    background-color: var(--purple-light);
    border-radius: 0.4rem;
    box-decoration-break: clone;
    color: var(--purple);
    padding: 0.1rem 0.3rem;
  }
}
</style>
