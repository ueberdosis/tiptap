<template>
  <div>
    <div class="actions">
      <button class="button" @click="setContent">
        Set Content
      </button>
      <button class="button" @click="clearContent">
        Clear Content
      </button>
      <button @click="editor.chain().focus().bold().run()" :class="{ 'is-active': editor.isActive('bold') }">
        Bold
      </button>
      <button @click="editor.chain().focus().italic().run()" :class="{ 'is-active': editor.isActive('italic') }">
        Italic
      </button>
    </div>

    <editor-content :editor="editor" />

    <div class="export">
      <h3>HTML</h3>
      <pre><code>{{ html }}</code></pre>
      <h3>JSON</h3>
      <pre><code v-html="json" /></pre>
    </div>
  </div>
</template>

<script>
import { Editor, EditorContent, defaultExtensions } from '@tiptap/vue-starter-kit'

export default {
  components: {
    EditorContent,
  },

  data() {
    return {
      editor: null,
      json: null,
      html: null,
    }
  },

  mounted() {
    this.editor = new Editor({
      content: `
        <p>
          What would be a text editor without content. At some point you want to get the content out of the editor and yes, we got you covered. There are two methods to export the current document as <code>HTML</code> or <code>JSON</code>.
        </p>
        <p>
          You can hook into the <code>update</code> event to get the content after every single change. How cool is that?
        </p>
      `,
      extensions: defaultExtensions(),
    })

    // Get the initial content …
    this.json = this.editor.getJSON()
    this.html = this.editor.getHTML()

    // … and get the content after every change.
    this.editor.on('update', () => {
      this.json = this.editor.getJSON()
      this.html = this.editor.getHTML()
    })
  },

  methods: {
    setContent() {
      // You can pass a JSON document …
      this.editor.setContent({
        type: 'document',
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

      // … but HTML strings are also supported.
      // this.editor.setContent('<p>This is some inserted text. 👋</p>')

      // It’s likely that you’d like to focus the Editor after most commands.
      this.editor.focus()
    },

    clearContent() {
      this.editor.clearContent(true)
      this.editor.focus()
    },
  },

  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>

<style lang="scss" scoped>
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
</style>
