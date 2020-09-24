<template>
  <div>
    <div class="actions">
      <button class="button" @click="clearContent">
        Clear Content
      </button>
      <button class="button" @click="setContent">
        Set Content
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

    this.json = this.editor.json()
    this.html = this.editor.html()

    this.editor.on('update', () => {
      this.json = this.editor.json()
      this.html = this.editor.html()
    })
  },

  methods: {
    clearContent() {
      this.editor.clearContent(true)
      this.editor.focus()
    },

    setContent() {
      // you can pass a json document
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
      // HTML string is also supported
      // this.editor.setContent('<p>This is some inserted text. 👋</p>')
      this.editor.focus()
    },
  },

  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>

<style lang="scss" src="./style.scss">
