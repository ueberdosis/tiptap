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
import Code from '@tiptap/extension-code'
import BulletList from '@tiptap/extension-bullet-list'
import ListItem from '@tiptap/extension-list-item'

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
        Focus.configure({
          className: 'has-focus',
          nested: true,
        }),
        Code,
        BulletList,
        ListItem,
      ],
      autofocus: true,
      content: `
        <p>
          The focus extension adds a class to the focused node only. That enables you to add a custom styling to just that node. By default, it’ll add <code>.has-focus</code>, even to nested nodes.
        </p>
        <ul>
          <li>Nested elements (like this list item) will be focused with the default setting of <code>nested: true</code>.</li>
          <li>Otherwise the whole list will get the focus class, even when just a single list item is selected.</li>
        </ul>
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

/* Basic editor styles */
.ProseMirror {
  > * + * {
    margin-top: 0.75em;
  }

  ul,
  ol {
    padding: 0 1rem;
  }

  blockquote {
    padding-left: 1rem;
    border-left: 2px solid rgba(#0D0D0D, 0.1);
  }
}
</style>
