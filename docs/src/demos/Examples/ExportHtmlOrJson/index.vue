<template>
  <div>
    <editor-content :editor="editor" />

    <div class="actions">
      <button class="button" @click="clearContent">
        Clear Content
      </button>
      <button class="button" @click="setContent">
        Set Content
      </button>
    </div>

    <div class="export">
      <h3>JSON</h3>
      <pre><code v-html="json"></code></pre>

      <h3>HTML</h3>
      <pre><code>{{ html }}</code></pre>
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
        <h2>
          Export HTML or JSON
        </h2>
        <p>
          You are able to export your data as <code>HTML</code> or <code>JSON</code>.
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

    window.editor = this.editor
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