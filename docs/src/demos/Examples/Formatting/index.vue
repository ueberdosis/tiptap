<template>
  <div>
    <div v-if="editor">
      <button @click="editor.chain().focus().bold().run()" :class="{ 'is-active': editor.isActive('bold') }">
        bold
      </button>
      <button @click="editor.chain().focus().italic().run()" :class="{ 'is-active': editor.isActive('italic') }">
        italic
      </button>
      <button @click="editor.chain().focus().heading({ level: 1 }).run()" :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }">
        h1
      </button>
      <button @click="editor.chain().focus().heading({ level: 2 }).run()" :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }">
        h2
      </button>
      <button @click="editor.chain().focus().heading({ level: 3 }).run()" :class="{ 'is-active': editor.isActive('heading', { level: 3 }) }">
        h3
      </button>
      <button @click="editor.chain().focus().paragraph().run()" :class="{ 'is-active': editor.isActive('paragraph') }">
        paragraph
      </button>
      <button @click="editor.chain().focus().textAlign('left').run()">
        left
      </button>
      <button @click="editor.chain().focus().textAlign('center').run()">
        center
      </button>
      <button @click="editor.chain().focus().textAlign('right').run()">
        right
      </button>
    </div>
    <editor-content :editor="editor" />
  </div>
</template>

<script>
import { Editor, EditorContent } from '@tiptap/vue-starter-kit'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Heading from '@tiptap/extension-heading'
import Bold from '@tiptap/extension-bold'
import Italic from '@tiptap/extension-italic'
import TextAlign from '@tiptap/extension-text-align'
import HardBreak from '@tiptap/extension-hard-break'

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
        Document(),
        Paragraph(),
        Text(),
        Heading({
          level: [1, 2, 3],
        }),
        Bold(),
        Italic(),
        TextAlign(),
        HardBreak(),
      ],
      content: `
        <h2>Cyndi Lauper – Girls Just Want to Have Fun</h2>
        <p>I come home in the morning light
        My mother says, “When you gonna live your life right?”
        Oh mother dear we’re not the fortunate ones
        And girls, they wanna have fun
        Oh girls just want to have fun</p>
        <p>The phone rings in the middle of the night
        My father yells, "What you gonna do with your life?"
        Oh daddy dear, you know you’re still number one
        But girls, they wanna have fun
        Oh girls just want to have</p>
        <p>That’s all they really want
        Some fun
        When the working day is done
        Oh girls, they wanna have fun
        Oh girls just wanna have fun (girls, they wanna, wanna have fun, girls wanna have)</p>
      `,
    })
  },

  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>
