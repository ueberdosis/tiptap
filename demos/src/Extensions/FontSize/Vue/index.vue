<template>
  <div v-if="editor" class="container">
    <div class="control-group">
      <div class="button-group">
        <button
          @click="editor.chain().focus().setFontSize('28px').run()"
          :class="{ 'is-active': editor.isActive('textStyle', { fontSize: '28px' }) }"
          data-test-id="28px"
        >
          Font size 28px
        </button>
        <button
          @click="editor.chain().focus().setFontSize('32px').run()"
          :class="{ 'is-active': editor.isActive('textStyle', { fontSize: '32px' }) }"
          data-test-id="32px"
        >
          Font size 32px
        </button>
        <button @click="editor.chain().focus().unsetFontSize().run()" data-test-id="unsetFontSize">
          Unset font size
        </button>
      </div>
    </div>
    <editor-content :editor="editor" />
  </div>
</template>

<script>
import { FontSize, TextStyle } from '@dibdab/extension-text-style'
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
      extensions: [StarterKit, TextStyle, FontSize],
      content: `
          <p>Adjusting font sizes can greatly affect the readability of your text, making it easier for users to engage with your content.</p>
          <p>When designing a website, it's crucial to balance large headings and smaller body text for a clean, organized layout.</p>
          <p>When setting font sizes, it's important to consider accessibility, ensuring that text is readable for users with different visual impairments.</p>
          <p><span style="font-size: 10px">Too small</span> a font size can strain the eyes, while <span style="font-size: 40px">too large</span> can disrupt the flow of the design.</p>
          <p>When designing for mobile, font sizes should be adjusted to maintain readability on smaller screens.</p>
        `,
    })
  },

  beforeUnmount() {
    this.editor.destroy()
  },
}
</script>
