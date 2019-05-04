<template>
  <div class="editor">
    <div class="outside-the-editor">
      <h3>Outside of the editor</h3>
      <button @click="toggleEditable">toggle editable</button>
      <input type="text" v-model="customString" autofocus placeholder="Type stuff">
    </div>
    <editor-content class="editor__content" :editor="editor" />
  </div>
</template>

<script>
import { Editor, EditorContent } from 'tiptap'
import {
  HardBreak,
  Heading,
  Bold,
  Italic,
  History,
} from 'tiptap-extensions'
import CustomProps from './custom-props.js'

export default {
  components: {
    EditorContent,
  },
  methods: {
    toggleEditable() {
      this.editor.setOptions({ editable: !this.editor.options.editable })
    },
  },
  computed: {
    customString: {
      get() { return this.editor.customProps.customString },
      set(value) {
        this.editor.customProps.customString = value
        return this.editor.customProps.customString
      }
    }
  },
  data() {
    return {
      editor: new Editor({
        extensions: [
          new HardBreak(),
          new Heading({ levels: [1, 2, 3] }),
          new Bold(),
          new Italic(),
          new History(),
          // custom extension
          new CustomProps(),
        ],
        editable: true,
        onInit({ customProps }) {
          customProps.customString = ''
        },
        content: `
          <h2>
            Custom Props
          </h2>
          <p>
            Pass properties from outside the editor to vue components inside the tiptap editor.
          </p>
          <custom-props></custom-props>
        `,
      }),
    }
  },
  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>

<style lang="scss">
  @import "~variables";

  .outside-the-editor {
    margin-bottom: 30px;
    border: 1px solid #efefef;
    padding: 10px;
    text-align: center;
    background: $color-grey;
  }

  .extra-props {
    padding: 10px;
    background: $color-grey;
    text-align: center;
  }
</style>

