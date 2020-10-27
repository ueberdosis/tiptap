<template>
  <div>
    <div class="actions">
      <button class="button" @click="setContent">
        Set Content
      </button>
      <button class="button" @click="clearContent">
        Clear Content
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
              text: 'This is some inserted text. 👋',
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

<style lang="scss">
.export {
  h3 {
    margin: 0.5rem 0;
  }
  pre {
    border-radius: 5px;
    color: #333;
  }

  code {
    display: block;
    white-space: pre-wrap;
    font-size: 0.8rem;
    padding: 1rem;
  }
}
</style>
