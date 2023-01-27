<template>
  <div v-if="editor">
    <editor-content :editor="editor" />
  </div>
</template>

<script>
import Openai from '@tiptap/extension-openai'
import StarterKit from '@tiptap/starter-kit'
import { Editor, EditorContent } from '@tiptap/vue-3'
import { Configuration, OpenAIApi } from 'openai'

const configuration = new Configuration({
  apiKey: 'your api key here',
})

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
        Openai.configure({
          openai: new OpenAIApi(configuration),
        }),
      ],
      content: `
        <p>Here is an exciting text to complete with my favorite prompt</p>
      `,
    })
  },

  beforeUnmount() {
    this.editor.destroy()
  },
}
</script>

<style lang="scss">
@use "sass:math";
.ProseMirror {
  > * + * {
    margin-top: 0.75em;
  }
}

.suggestion {
  position: absolute;
  z-index: 0;
  margin: 0;
  pointer-events: none;
  color: gray;
  white-space: normal;
}

.prompt{
  position: relative;
}

</style>
