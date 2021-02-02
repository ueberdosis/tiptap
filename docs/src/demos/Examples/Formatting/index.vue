<template>
  <div>
    <div v-if="editor">
      <button @click="editor.chain().focus().toggleBold().run()" :class="{ 'is-active': editor.isActive('bold') }">
        bold
      </button>
      <button @click="editor.chain().focus().toggleItalic().run()" :class="{ 'is-active': editor.isActive('italic') }">
        italic
      </button>
      <button @click="editor.chain().focus().toggleHeading({ level: 1 }).run()" :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }">
        h1
      </button>
      <button @click="editor.chain().focus().toggleHeading({ level: 2 }).run()" :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }">
        h2
      </button>
      <button @click="editor.chain().focus().toggleHeading({ level: 3 }).run()" :class="{ 'is-active': editor.isActive('heading', { level: 3 }) }">
        h3
      </button>
      <button @click="editor.chain().focus().setParagraph().run()" :class="{ 'is-active': editor.isActive('paragraph') }">
        paragraph
      </button>
      <button @click="editor.chain().focus().setTextAlign('left').run()" :class="{ 'is-active': editor.isActive({ textAlign: 'left' }) }">
        left
      </button>
      <button @click="editor.chain().focus().setTextAlign('center').run()" :class="{ 'is-active': editor.isActive({ textAlign: 'center' }) }">
        center
      </button>
      <button @click="editor.chain().focus().setTextAlign('right').run()" :class="{ 'is-active': editor.isActive({ textAlign: 'right' }) }">
        right
      </button>
      <button @click="editor.chain().focus().setTextAlign('justify').run()" :class="{ 'is-active': editor.isActive({ textAlign: 'justify' }) }">
        justify
      </button>
    </div>
    <editor-content :editor="editor" />
  </div>
</template>

<script>
import { defaultExtensions, Editor, EditorContent } from '@tiptap/vue-starter-kit'
import TextAlign from '@tiptap/extension-text-align'

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
        TextAlign,
      ],
      content: `
        <h3>
          Girls Just Want to Have Fun (Cyndi Lauper)
        </h3>
        <p>
          I come home in the morning light<br>
          My mother says, “When you gonna live your life right?”<br>
          Oh mother dear we’re not the fortunate ones<br>
          And girls, they wanna have fun<br>
          Oh girls just want to have fun</p>
          <p style="text-align: center">The phone rings in the middle of the night<br>
          My father yells, "What you gonna do with your life?"<br>
          Oh daddy dear, you know you’re still number one<br>
          But girls, they wanna have fun<br>
          Oh girls just want to have
        </p>
        <p style="text-align:right">
          That’s all they really want<br>
          Some fun<br>
          When the working day is done<br>
          Oh girls, they wanna have fun<br>
          Oh girls just wanna have fun<br>
          (girls, they wanna, wanna have fun, girls wanna have)
        </p>
        <p style="text-align:justify">
          Some boys take a beautiful girl
          And hide her away from the rest of the world
          I want to be the one to walk in the sun
          Oh girls, they wanna have fun
          Oh girls just wanna have
        </p>
        <p style="text-align:justify">
          That's all they really want
          Some fun
          When the working day is done
          Oh girls, they wanna have fun
          Oh girls just want to have fun (girls, they wanna, wanna have fun, girls wanna have)
          They just wanna, they just wanna (girls)
          They just wanna, they just wanna, oh girl (girls just wanna have fun)
          Girls just wanna have fun
          They just wanna, they just wanna
          They just wanna, they just wanna (girls)
          They just wanna, they just wanna, oh girl (girls just wanna have fun)
          Girls just want to have fun
        </p>
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
</style>
