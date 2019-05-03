<template>
  <div class="editor">
    <div class="outside-the-editor">
      <h3>Outside of the editor</h3>
      <input type="text" v-model="fromOutsideTheEditor" autofocus placeholder="Type stuff">
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
import ExtraProps from './extra-props.js'

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
    fromOutsideTheEditor: {
      get() { return this.editor.extraProps.fromOutsideTheEditor },
      set(value) {
        this.editor.extraProps.fromOutsideTheEditor = value
        return this.editor.extraProps.fromOutsideTheEditor
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
          new ExtraProps(),
        ],
        editable: true,
        onInit({ extraProps }) {
          extraProps.fromOutsideTheEditor = ''
        },
        content: `
          <h2>
            ExtraProps
          </h2>
          <p>
            Pass properties from outside the editor to vue components inside the tiptap editor.
          </p>
          <extra-props></extra-props>
          <p>
            You can even add the Vuex store to the extraProps to get access to Vuex.
          </p>
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

