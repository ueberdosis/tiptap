<template>
  <div>
    BUG: Headings can’t be transformed to a bullet or ordered list.
    <div v-if="editor">
      <button @click="editor.chain().focus().bold().run()" :class="{ 'is-active': editor.isActive('bold') }">
        bold
      </button>
      <button @click="editor.chain().focus().italic().run()" :class="{ 'is-active': editor.isActive('italic') }">
        italic
      </button>
      <button @click="editor.chain().focus().strike().run()" :class="{ 'is-active': editor.isActive('strike') }">
        strike
      </button>
      <button @click="editor.chain().focus().code().run()" :class="{ 'is-active': editor.isActive('code') }">
        code
      </button>
      <button @click="editor.chain().focus().removeMarks().run()">
        clear format
      </button>
      <button @click="editor.chain().focus().paragraph().run()" :class="{ 'is-active': editor.isActive('paragraph') }">
        paragraph
      </button>
      <button @click="editor.chain().focus().heading({ level: 1 }).run()" :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }">
        h1
      </button>
      <button @click="editor.chain().focus().heading({ level: 2 }).run()" :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }">
        h2
      </button>
      <button @click="editor.chain().focus().heading({ level: 3 }).run()" :class="{ 'is-active': editor.isActive('heading', { level: 3 }) }">
        h3
      </button>
      <button @click="editor.chain().focus().heading({ level: 4 }).run()" :class="{ 'is-active': editor.isActive('heading', { level: 4 }) }">
        h4
      </button>
      <button @click="editor.chain().focus().heading({ level: 5 }).run()" :class="{ 'is-active': editor.isActive('heading', { level: 5 }) }">
        h5
      </button>
      <button @click="editor.chain().focus().heading({ level: 6 }).run()" :class="{ 'is-active': editor.isActive('heading', { level: 6 }) }">
        h6
      </button>
      <button @click="editor.chain().focus().bulletList().run()" :class="{ 'is-active': editor.isActive('bullet_list') }">
        bullet list
      </button>
      <button @click="editor.chain().focus().orderedList().run()" :class="{ 'is-active': editor.isActive('ordered_list') }">
        ordered list
      </button>
      <button @click="editor.chain().focus().codeBlock().run()" :class="{ 'is-active': editor.isActive('codeBlock') }">
        code block
      </button>
      <button @click="editor.chain().focus().blockquote().run()" :class="{ 'is-active': editor.isActive('blockquote') }">
        blockquote
      </button>
      <button @click="editor.chain().focus().horizontalRule().run()">
        horizontal rule
      </button>
      <button @click="editor.chain().focus().hardBreak().run()">
        hard break
      </button>
      <button @click="editor.chain().focus().undo().run()">
        undo
      </button>
      <button @click="editor.chain().focus().redo().run()">
        redo
      </button>
    </div>
    <editor-content :editor="editor" />
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
    }
  },

  mounted() {
    this.editor = new Editor({
      extensions: defaultExtensions(),
      content: `
        <h2>
          Hi there,
        </h2>
        <p>
          this is a basic <em>basic</em> example of <strong>tiptap</strong>. Sure, there are all kind of basic text styles you’d probably expect from a text editor. But wait until you see the bullet lists:
        </p>
        <ul>
          <li>
            With one …
          </li>
          <li>
            … or two list items.
          </li>
          <li>
            And yes, even more.
          </li>
        </ul>
        <p>
          Isn’t that great? But wait, there’s more. Let’s try a code block:
        </p>
        <pre><code class="language-css">body { display: none; }</code></pre>
        <p>
          I know, I know, it’s impressive. Give it a try and click a little bit around. But don’t forget to check the other examples too.
        </p>
        <blockquote>
          Wow, that’s amazing. Good work, boy! 👏
          <br />
          — Mom
        </blockquote>
      `,
    })
  },

  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>
