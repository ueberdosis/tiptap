<template>
  <div>
    <div class="actions" v-if="editor">
      <button class="button" @click="setContent">
        Set Content
      </button>
      <button class="button" @click="clearContent">
        Clear Content
      </button>
      <button @click="editor.chain().focus().toggleBold().run()" :class="{ 'is-active': editor.isActive('bold') }">
        Bold
      </button>
      <button @click="editor.chain().focus().toggleItalic().run()" :class="{ 'is-active': editor.isActive('italic') }">
        Italic
      </button>
    </div>

    <editor-content :editor="editor" />

    <div class="export">
      <h3>JSON</h3>
      <pre><code v-html="json" /></pre>
    </div>
  </div>
</template>

<script>
import { Editor, EditorContent } from '@tiptap/vue-2'
import { defaultExtensions } from '@tiptap/starter-kit'

export default {
  components: {
    EditorContent,
  },

  data() {
    return {
      editor: null,
      json: null,
    }
  },

  mounted() {
    this.editor = new Editor({
      content: `
        <p>
          Wow, this editor instance exports its content as JSON.
        </p>
      `,
      extensions: defaultExtensions(),
    })

    // Get the initial content …
    this.json = this.editor.getJSON()

    // … and get the content after every change.
    this.editor.on('update', () => {
      this.json = this.editor.getJSON()
    })
  },

  methods: {
    setContent() {
      // You can pass a JSON document to the editor.
      this.editor.commands.setContent({
        type: 'doc',
        content: [{
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'It’s 19871. You can’t turn on a radio, or go to a mall without hearing Olivia Newton-John’s hit song, Physical.',
            },
          ],
        }],
      }, true)

      // It’s likely that you’d like to focus the Editor after most commands.
      this.editor.commands.focus()
    },

    clearContent() {
      this.editor
        .chain()
        .clearContent(true)
        .focus()
        .run()
    },
  },

  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>

<style lang="scss">
/* Style the export */
.export {
  padding: 1rem 0 0;

  h3 {
    margin: 1rem 0 0.5rem;
  }

  pre {
    border-radius: 5px;
    color: #333;
  }

  code {
    display: block;
    white-space: pre-wrap;
    font-size: 0.8rem;
    padding: 0.75rem 1rem;
    background-color:#e9ecef;
    color: #495057;
  }
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
      padding: 0;
      background: none;
      font-size: 0.8rem;
    }
  }

  img {
    max-width: 100%;
    height: auto;
  }

  hr {
    margin: 1rem 0;
  }

  blockquote {
    padding-left: 1rem;
    border-left: 2px solid rgba(#0D0D0D, 0.1);
  }
}
</style>
