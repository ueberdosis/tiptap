<template>
  <editor-content :editor="editor" />
</template>

<script>
import { Editor, EditorContent } from '@tiptap/vue-starter-kit'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Heading from '@tiptap/extension-heading'
import Typography from '@tiptap/extension-typography'
import { ColorHighlighter } from './ColorHighlighter'

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
        Heading.configure({
          levels: [1, 2],
        }),
        Typography,
        ColorHighlighter,
      ],
      content: `
        <h2>
          What’s a savvy text editor?
        </h2>
        <p>
          Maybe an editor which detects hex colors like #FFF, #0D0D0D, #616161, #A975FF, #FB5151, #FD9170, #FFCB6B, #68CEF8, #80cbc4, or #9DEF8F and adds a color swatch to them while you type.
        </p>
        <p>
          → Or an editor, which knows »what you mean« and adds the correct characters to your text — like a “typography nerd” on your side. That should be the 1×1, right? Try it out and type (c), ->, >>, 1/2, !=, -- here:
        </p>
        <p></p>
      `,
    })
  },

  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>

<style lang="scss">
/* Basic editor styles */
.ProseMirror {
  > * + * {
    margin-top: 0.75em;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    line-height: 1.1;
  }
}

/* Color swatches */
.color {
  white-space: nowrap;

  &::before {
    content: ' ';
    display: inline-block;
    width: 1em;
    height: 1em;
    border: 1px solid rgba(128, 128, 128, 0.3);
    vertical-align: middle;
    margin-right: 0.1em;
    margin-bottom: 0.15em;
    border-radius: 2px;
    background-color: var(--color);
  }
}
</style>
