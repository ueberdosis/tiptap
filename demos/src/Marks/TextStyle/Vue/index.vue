<template>
  <div v-if="editor">
    <editor-content :editor="editor" />
  </div>
</template>

<script>
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import TextStyle from '@tiptap/extension-text-style'
import { Editor, EditorContent } from '@tiptap/vue-3'

import { AddGlobalAttributes } from './AddGlobalAttributes.ts'

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
        TextStyle.configure({ mergeNestedSpanStyles: true }),
        AddGlobalAttributes,
      ],
      content: `
        <p><span>This has a &lt;span&gt; tag without a style attribute, so it’s thrown away.</span></p>
        <p><span style="">But this one is wrapped in a &lt;span&gt; tag with an inline style attribute, so it’s kept - even if it’s empty for now.</span></p>


        <p>--- merge Nested Span Styles option enabled ---</p>

        <p>
          <span style="color: #ff0000;">
            <span style="font-family: serif; font-size: 20px;">
              red 20px serif
            </span>
          </span>
        </p>

        <p>
          <span style="color: #0000FF;">
            <span style="font-family: serif;">
              <span style="font-size: 24px;">
                blue 24px serif
              </span>
            </span>
          </span>
        </p>

        <p>
          <span style="color: #00FF00;">
            <span style="font-family: serif;">green serif </span>
            <span style="font-size: 24px;">green 24px </span>
            <span style="font-family: serif;color: #ff0000;">red serif</span>
          </span>
        </p>

        <p>
          plain 
          <span style="color: #0000FF;">blue</span>
          plain
          <span style="color: #00FF00;">
            green
            <span style="font-family: serif;">green serif</span>
          </span>
          plain
        </p>

        <p>
            <span style="color: #0000FF;">
              blue
              <span style="color: #00FF00;">
                green
                <span style="font-family: serif;">green serif</span>
              </span>
            </span>
        </p>
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
