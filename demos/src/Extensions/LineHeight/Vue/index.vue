<template>
  <div v-if="editor" class="container">
    <div class="control-group">
      <div class="button-group">
        <button
          @click="editor.chain().focus().toggleTextStyle({ lineHeight: '1.5' }).run()"
          :class="{ 'is-active': editor.isActive('textStyle', { lineHeight: '1.5' }) }"
          data-test-id="1.5"
        >
          Line height 1.5
        </button>
        <button
          @click="editor.chain().focus().toggleTextStyle({ lineHeight: '2.0' }).run()"
          :class="{ 'is-active': editor.isActive('textStyle', { lineHeight: '2.0' }) }"
          data-test-id="2.0"
        >
          Line height 2.0
        </button>
        <button
          @click="editor.chain().focus().toggleTextStyle({ lineHeight: '4.0' }).run()"
          :class="{ 'is-active': editor.isActive('textStyle', { lineHeight: '4.0' }) }"
          data-test-id="4.0"
        >
          Line height 4.0
        </button>
        <button @click="editor.chain().focus().unsetLineHeight().run()" data-test-id="unsetLineHeight">
          Unset line height
        </button>
      </div>
    </div>
    <editor-content :editor="editor" />
  </div>
</template>

<script>
import './styles.scss'

import { LineHeight, TextStyle } from '@dibdab/extension-text-style'
import StarterKit from '@dibdab/starter-kit'
import { Editor, EditorContent } from '@dibdab/vue-3'

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
      extensions: [StarterKit, TextStyle, LineHeight],
      content: `
        <p>Adjusting line heights can greatly affect the readability of your text, making it easier for users to engage with your content.</p>
        <p>Line height is the vertical distance between lines of text in a paragraph. It's also known as leading, which comes from the days of metal type, when strips of lead were placed between lines of type to add space.</p>
        <p>Line height is expressed as a ratio, meaning the default line height is 1.0. A line height of 1.5 would be 1.5 times the height of the font, while a line height of 2.0 would be twice the height of the font.</p>
        <p>It's important to choose a line height that's appropriate for your font size and line length. A line height that's too small can make text feel cramped, while a line height that's too large can make text feel disconnected.</p>
        <p><span style="line-height: 1.5">This paragraph has a line height of 1.5.</span></p>
        <p>This paragraph has the default line height of 1.0.</p>
        <p><span style="line-height: 4.0">This paragraph has a line height of 4.0.</span></p>
      `,
    })
  },

  beforeUnmount() {
    this.editor.destroy()
  },
}
</script>
