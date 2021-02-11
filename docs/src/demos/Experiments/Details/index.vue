<template>
  <div v-if="editor">
    <button @click="editor.chain().focus().toggleBlockquote().run()" :class="{ 'is-active': editor.isActive('details') }">
      details
    </button>

    <editor-content :editor="editor" />

    <h2>HTML</h2>
    {{ editor.getHTML() }}

    <h2>Issues</h2>
    <ul>
      <li>Commands don’t work</li>
      <li>Fails to open nested details</li>
      <li>Node can’t be deleted (if it’s the last node)</li>
    </ul>
  </div>
</template>

<script>
import {
  Editor, EditorContent, defaultExtensions,
} from '@tiptap/vue-starter-kit'
import Details from './details'
import DetailsSummary from './details-summary'

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
        Details,
        DetailsSummary,
      ],
      content: `
        <p>Here is a details list:</p>
        <details>
          <summary>An open details tag</summary>
          <p>More info about the details.</p>
        </details>
        <details>
          <summary>A closed details tag</summary>
          <p>More info about the details.</p>
        </details>
        <p>That’s it.</p>
      `,
    })
  },

  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>

<style lang="scss">
.ProseMirror {
  > * + * {
    margin-top: 0.75em;
  }

  details,
  [data-type="details"] {
    display: flex;

    [data-type="detailsContent"] > *:not(summary) {
      display: none;
    }

    [data-type="detailsToggle"]::before {
      cursor: pointer;
      content: '▸';
      display: inline-block;
      width: 1em;
    }

    &[open] {
      [data-type="detailsContent"] > *:not(summary) {
        display: inherit;
      }

      [data-type="detailsToggle"]::before {
        content: '▾';
      }
    }
  }
}
</style>
