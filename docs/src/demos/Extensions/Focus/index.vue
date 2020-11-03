<template>
  <div>
    <editor-content :editor="editor" />
  </div>
</template>

<script>
import { Editor, EditorContent } from '@tiptap/vue-starter-kit'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Focus from '@tiptap/extension-focus'

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
        Focus({
          className: 'has-focus',
          nested: true,
        }),
      ],
      autoFocus: true,
      content: `
        <p>
          The focus extension adds a class to the focused node only. That enables you to add a custom styling to just that node. By default, it’ll add <code>.has-focus</code>, even to nested nodes.
        </p>
        <p>
          Nested elements will be focused with the default setting nested: true. Otherwise the whole item will get the focus class, even when just a single nested item is selected.
        </p>
      `,
    })
  },

  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>

<style lang="scss">
.has-focus {
  border-radius: 3px;
  box-shadow: 0 0 0 3px #68CEF8;
}
</style>
