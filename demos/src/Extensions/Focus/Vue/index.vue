<template>
  <editor-content :editor="editor" />
</template>

<script>
import Code from '@dibdab/extension-code'
import Document from '@dibdab/extension-document'
import { BulletList, ListItem } from '@dibdab/extension-list'
import Paragraph from '@dibdab/extension-paragraph'
import Text from '@dibdab/extension-text'
import { Focus } from '@dibdab/extensions'
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
      extensions: [
        Document,
        Paragraph,
        Text,
        Focus.configure({
          className: 'has-focus',
          mode: 'all',
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
          <li>Nested elements (like this list item) will be focused with the default setting of <code>mode: all</code>.</li>
          <li>Otherwise the whole list will get the focus class, even when just a single list item is selected.</li>
        </ul>
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

  /* List styles */
  ul,
  ol {
    padding: 0 1rem;
    margin: 1.25rem 1rem 1.25rem 0.4rem;

    li p {
      margin-top: 0.25em;
      margin-bottom: 0.25em;
    }
  }

  /* Code and preformatted text styles */
  code {
    background-color: var(--purple-light);
    border-radius: 0.4rem;
    color: var(--black);
    font-size: 0.85rem;
    padding: 0.25em 0.3em;
  }

  // Focus styles
  .has-focus {
    border-radius: 3px;
    box-shadow: 0 0 0 2px var(--purple);
  }
}
</style>
