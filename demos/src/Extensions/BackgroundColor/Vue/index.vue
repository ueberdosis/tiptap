<template>
  <div v-if="editor" class="container">
    <div class="control-group">
      <div class="button-group">
        <input
          type="color"
          @input="editor.chain().focus().setBackgroundColor($event.target.value).run()"
          :value="editor.getAttributes('textStyle').backgroundColor"
          data-testid="setBackgroundColor"
        />
        <button
          @click="editor.chain().focus().setBackgroundColor('#958DF1').run()"
          :class="{ 'is-active': editor.isActive('textStyle', { backgroundColor: '#958DF1' }) }"
          data-testid="setPurple"
        >
          Purple
        </button>
        <button
          @click="editor.chain().focus().setBackgroundColor('#F98181').run()"
          :class="{ 'is-active': editor.isActive('textStyle', { backgroundColor: '#F98181' }) }"
          data-testid="setRed"
        >
          Red
        </button>
        <button
          @click="editor.chain().focus().setBackgroundColor('#FBBC88').run()"
          :class="{ 'is-active': editor.isActive('textStyle', { backgroundColor: '#FBBC88' }) }"
          data-testid="setOrange"
        >
          Orange
        </button>
        <button
          @click="editor.chain().focus().setBackgroundColor('#FAF594').run()"
          :class="{ 'is-active': editor.isActive('textStyle', { backgroundColor: '#FAF594' }) }"
          data-testid="setYellow"
        >
          Yellow
        </button>
        <button
          @click="editor.chain().focus().setBackgroundColor('#70CFF8').run()"
          :class="{ 'is-active': editor.isActive('textStyle', { backgroundColor: '#70CFF8' }) }"
          data-testid="setBlue"
        >
          Blue
        </button>
        <button
          @click="editor.chain().focus().setBackgroundColor('#94FADB').run()"
          :class="{ 'is-active': editor.isActive('textStyle', { backgroundColor: '#94FADB' }) }"
          data-testid="setTeal"
        >
          Teal
        </button>
        <button
          @click="editor.chain().focus().setBackgroundColor('#B9F18D').run()"
          :class="{ 'is-active': editor.isActive('textStyle', { backgroundColor: '#B9F18D' }) }"
          data-testid="setGreen"
        >
          Green
        </button>
        <button @click="editor.chain().focus().unsetBackgroundColor().run()" data-testid="unsetBackgroundColor">
          Unset color
        </button>
      </div>
    </div>
    <editor-content :editor="editor" />
  </div>
</template>

<script>
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { BackgroundColor, TextStyle } from '@tiptap/extension-text-style'
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
      extensions: [Document, Paragraph, Text, TextStyle, BackgroundColor],
      content: `
        <p><span style="background-color: #958DF1">Oh, for some reason that’s purple.</span></p>
        <p><span style="background-color: rgba(149, 141, 241, 0.5)">Oh, for some reason that’s purple but with rgba.</span></p>
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
}
</style>
