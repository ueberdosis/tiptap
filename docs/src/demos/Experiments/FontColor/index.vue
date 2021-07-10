<template>
  <div v-if="editor">
    <button @click="editor.chain().focus().setFontColor('#958DF1').run()" :class="{ 'is-active': editor.isActive('textStyle', { fontColor: '#958DF1' })}">
      purple
    </button>
    <button @click="editor.chain().focus().setFontColor('#F98181').run()" :class="{ 'is-active': editor.isActive('textStyle', { fontColor: '#F98181' })}">
      red
    </button>
    <button @click="editor.chain().focus().setFontColor('#FBBC88').run()" :class="{ 'is-active': editor.isActive('textStyle', { fontColor: '#FBBC88' })}">
      orange
    </button>
    <button @click="editor.chain().focus().setFontColor('#FAF594').run()" :class="{ 'is-active': editor.isActive('textStyle', { fontColor: '#FAF594' })}">
      yellow
    </button>
    <button @click="editor.chain().focus().setFontColor('#70CFF8').run()" :class="{ 'is-active': editor.isActive('textStyle', { fontColor: '#70CFF8' })}">
      blue
    </button>
    <button @click="editor.chain().focus().setFontColor('#94FADB').run()" :class="{ 'is-active': editor.isActive('textStyle', { fontColor: '#94FADB' })}">
      teal
    </button>
    <button @click="editor.chain().focus().setFontColor('#B9F18D').run()" :class="{ 'is-active': editor.isActive('textStyle', { fontColor: '#B9F18D' })}">
      green
    </button>
    <button @click="editor.chain().focus().unsetFontColor().run()">
      remove color
    </button>

    <editor-content :editor="editor" />
  </div>
</template>

<script>
import { Editor, EditorContent } from '@tiptap/vue-2'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import TextStyle from '@tiptap/extension-text-style'
import { FontColor } from './font-color'

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
        FontColor,
      ],
      content: `
        <p><span style="color: #958DF1">Oh, that’s purple for some reason.</span></p>
      `,
    })
  },

  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>
