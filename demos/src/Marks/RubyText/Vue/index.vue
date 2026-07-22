<!-- fallow-ignore-file unused-file -->
<template>
  <div v-if="editor" class="container">
    <div class="control-group">
      <form class="button-group" @submit.prevent="editor.chain().focus().setRubyText({ rt }).run()">
        <label>
          Ruby text (rt):
          <input data-test-id="ruby-text-input" type="text" v-model="rt" />
        </label>
        <button
          data-test-id="set-ruby-text-button"
          type="submit"
          :disabled="editor.state.selection.empty"
        >
          Set ruby text
        </button>
        <button
          data-test-id="unset-ruby-text-button"
          type="button"
          @click="editor.chain().focus().unsetRubyText().run()"
          :disabled="!editor.isActive('rubyText')"
        >
          Unset ruby text
        </button>
      </form>
    </div>
    <editor-content :editor="editor" />
  </div>
</template>

<script>
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import RubyText from '@tiptap/extension-ruby-text'
import Text from '@tiptap/extension-text'
import { Editor, EditorContent } from '@tiptap/vue-3'

export default {
  components: {
    EditorContent,
  },

  data() {
    return {
      editor: null,
      rt: '',
    }
  },

  mounted() {
    this.editor = new Editor({
      extensions: [Document, Paragraph, Text, RubyText],
      content: `
        <p><ruby>東京<rt>とうきょう</rt></ruby>は日本の首都です。</p>
        <p><ruby>漢字<rt>かんじ</rt></ruby>の上にルビを表示できます。</p>
      `,
      onSelectionUpdate: ({ editor }) => {
        this.rt = editor.getAttributes('rubyText').rt ?? ''
      },
    })
  },

  beforeUnmount() {
    this.editor.destroy()
  },
}
</script>

<style lang="scss">
.tiptap {
  :first-child {
    margin-top: 0;
  }

  ruby {
    ruby-position: over;
  }

  rt {
    cursor: text;
    pointer-events: auto;

    input {
      font: inherit;
      margin: 0;
    }
  }
}

.control-group input {
  margin-left: 0.5rem;
}
</style>
