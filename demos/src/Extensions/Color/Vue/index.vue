<template>
  <div v-if="editor" class="container">
    <div class="control-group">
      <div class="button-group">
        <input
          type="color"
          @input="editor.chain().focus().setColor($event.target.value).run()"
          :value="editor.getAttributes('textStyle').color"
        >
        <button @click="editor.chain().focus().setColor('#958DF1').run()" :class="{ 'is-active': editor.isActive('textStyle', { color: '#958DF1' })}">
          Purple
        </button>
        <button @click="editor.chain().focus().setColor('#F98181').run()" :class="{ 'is-active': editor.isActive('textStyle', { color: '#F98181' })}">
          Red
        </button>
        <button @click="editor.chain().focus().setColor('#FBBC88').run()" :class="{ 'is-active': editor.isActive('textStyle', { color: '#FBBC88' })}">
          Orange
        </button>
        <button @click="editor.chain().focus().setColor('#FAF594').run()" :class="{ 'is-active': editor.isActive('textStyle', { color: '#FAF594' })}">
          Yellow
        </button>
        <button @click="editor.chain().focus().setColor('#70CFF8').run()" :class="{ 'is-active': editor.isActive('textStyle', { color: '#70CFF8' })}">
          Blue
        </button>
        <button @click="editor.chain().focus().setColor('#94FADB').run()" :class="{ 'is-active': editor.isActive('textStyle', { color: '#94FADB' })}">
          Teal
        </button>
        <button @click="editor.chain().focus().setColor('#B9F18D').run()" :class="{ 'is-active': editor.isActive('textStyle', { color: '#B9F18D' })}">
          Green
        </button>
        <button @click="editor.chain().focus().unsetColor().run()">
          Unset color
        </button>
      </div>
    </div>
    <editor-content :editor="editor" />
  </div>
</template>

<script>
import { Color } from '@tiptap/extension-color'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import TextStyle from '@tiptap/extension-text-style'
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
        Document,
        Paragraph,
        Text,
        TextStyle,
        Color,
      ],
      content: `
        <p><span style="color: #958DF1">Oh, for some reason that’s purple.</span></p>
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
