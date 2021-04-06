<template>
  <div v-if="editor">
    <editor-content :editor="editor" />
  </div>
</template>

<script>
import { Editor, EditorContent } from '@tiptap/vue-2'
import { defaultExtensions } from '@tiptap/starter-kit'
import DragHandle from './DragHandle.js'

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
        ...defaultExtensions(),
        DragHandle,
      ],
      content: `
        <p>paragraph 1</p>
        <p>paragraph 2</p>
        <p>paragraph 3</p>
        <ul>
          <li>list item 1</li>
          <li>list item 2</li>
        </ul>
        <pre>code</pre>
      `,
      onUpdate: () => {
        console.log(this.editor.getHTML())
      },
    })
  },

  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>

<style lang="scss">
.global-drag-handle {
  position: absolute;

  &::after {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1rem;
    height: 1.25rem;
    content: '⠿';
    font-weight: 700;
    cursor: grab;
    background:#0D0D0D10;
    color: #0D0D0D50;
    border-radius: 0.25rem;
  }
}
</style>

<style lang="scss" scoped>
::v-deep {
  .ProseMirror {
    padding: 0 1rem;

    > * + * {
      margin-top: 0.75em;
    }

    ul,
    ol {
      padding: 0 1rem;
    }

    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      line-height: 1.1;
    }

    code {
      background-color: rgba(#616161, 0.1);
      color: #616161;
    }

    pre {
      background: #0D0D0D;
      color: #FFF;
      font-family: 'JetBrainsMono', monospace;
      padding: 0.75rem 1rem;
      border-radius: 0.5rem;

      code {
        color: inherit;
        background: none;
        font-size: 0.8rem;
      }
    }

    img {
      max-width: 100%;
      height: auto;
    }

    blockquote {
      padding-left: 1rem;
      border-left: 2px solid rgba(#0D0D0D, 0.1);
    }

    hr {
      border: none;
      border-top: 2px solid rgba(#0D0D0D, 0.1);
      margin: 2rem 0;
    }
  }

  .ProseMirror-selectednode {
    outline: 2px solid #70CFF8;
  }
}
</style>
