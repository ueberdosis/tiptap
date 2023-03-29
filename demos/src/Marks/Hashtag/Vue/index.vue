<template>
  <div v-if="editor">
    <editor-content :editor="editor" />
  </div>
</template>

<script>
import Hashtag from '@tiptap/extension-hashtag'
import StarterKit from '@tiptap/starter-kit'
import { Editor, EditorContent } from '@tiptap/vue-3'

import suggestion from './suggestion'

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
        Hashtag.configure({
          HTMLAttributes: {
            dataType: 'hashtag',
          },
          suggestion,
        }),
      ],
      content: `
        <p>Hi everyone! Don’t forget the <span data-type="hashtag">#daily_standup</span> up at 8 AM.</p>
        <p>Would you mind to share what you’ve been working on lately? We fear not much happened since <span class="hashtag" data-type="hashtag">#dirty_dancing</span>.
        <p><span data-type="mention" data-id="Winona Ryder"></span> <span data-type="mention" data-id="Axl Rose"></span> Let’s go through your most important points quickly.</p>
        <p>I have a meeting with <span data-type="mention" data-id="Christina Applegate"></span> and don’t want to come late.</p>
        <p>– Thanks, your <span class="hashtag" data-type="hashtag">#big_boss</span></p>
      `,
    })
  },

  beforeUnmount() {
    this.editor.destroy()
  },
}
</script>

<style lang="scss">
.ProseMirror {
  > * + * {
    margin-top: 0.75em;
  }
}

.hashtag {
  color: dodgerblue;
}
</style>
