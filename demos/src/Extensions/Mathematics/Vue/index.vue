<template>
  <div v-if="editor" class="container">
    <div class="control-group">
      <label>
        <input type="checkbox" :checked="!isEditable" @change="toggleEditing" />
        Readonly
      </label>
    </div>
    <editor-content :editor="editor" />
  </div>
</template>

<script>
import 'katex/dist/katex.min.css'

import { Mathematics } from '@tiptap/extension-mathematics'
import StarterKit from '@tiptap/starter-kit'
import { Editor, EditorContent } from '@tiptap/vue-3'
import { defineComponent } from 'vue'

export default defineComponent({
  components: {
    EditorContent,
  },

  data() {
    return {
      editor: null,
      isEditable: true,
    }
  },

  mounted() {
    this.editor = new Editor({
      extensions: [StarterKit, Mathematics],
      content: `
        <h1>
          This editor supports $\\LaTeX$ math expressions.
        </h1>
        <p>
          Did you know that $3 * 3 = 9$? Isn't that crazy? Also Pythagoras' theorem is $a^2 + b^2 = c^2$.<br />
          Also the square root of 2 is $\\sqrt{2}$. If you want to know more about $\\LaTeX$ visit <a href="https://katex.org/docs/supported.html" target="_blank">katex.org</a>.
        </p>
        <code>
          <pre>$\\LaTeX$</pre>
        </code>
        <p>
          Do you want go deeper? Here is a list of all supported functions:
        </p>
        <ul>
          <li>$\\sin(x)$</li>
          <li>$\\cos(x)$</li>
          <li>$\\tan(x)$</li>
          <li>$\\log(x)$</li>
          <li>$\\ln(x)$</li>
          <li>$\\sqrt{x}$</li>
          <li>$\\sum_{i=0}^n x_i$</li>
          <li>$\\int_a^b x^2 dx$</li>
          <li>$\\frac{1}{x}$</li>
          <li>$\\binom{n}{k}$</li>
          <li>$\\sqrt[n]{x}$</li>
          <li>$\\left(\\frac{1}{x}\\right)$</li>
          <li>$\\left\\{\\begin{matrix}x&\\text{if }x>0\\\\0&\\text{otherwise}\\end{matrix}\\right.$</li>
        </ul>
      `,
    })
  },

  beforeUnmount() {
    this.editor.destroy()
  },

  methods: {
    toggleEditing() {
      this.isEditable = !this.isEditable

      if (this.editor) {
        this.editor.setEditable(this.isEditable)
      }
    },
  },
})
</script>

<style lang="scss">
/* Basic editor styles */
.tiptap {
  :first-child {
    margin-top: 0;
  }

  // Mathematics extension styles
  .Tiptap-mathematics-editor {
    background: #202020;
    color: #fff;
    font-family: monospace;
    padding: 0.2rem 0.5rem;
  }

  .Tiptap-mathematics-render {
    padding: 0 0.25rem;

    &--editable {
      cursor: pointer;
      transition: background 0.2s;

      &:hover {
        background: #eee;
      }
    }
  }

  .Tiptap-mathematics-editor,
  .Tiptap-mathematics-render {
    border-radius: 0.25rem;
    display: inline-block;
  }
}
</style>
