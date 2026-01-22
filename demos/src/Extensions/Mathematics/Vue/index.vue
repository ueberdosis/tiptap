<template>
  <div v-if="editor" class="container">
    <div class="control-group">
      <label>
        <input type="checkbox" :checked="!isEditable" @change="toggleEditing" />
        Readonly
      </label>
    </div>
    <div v-if="editor" class="control-group">
      <div class="button-group">
        <button @click="onInsertInlineMath">Insert inline math</button>
        <button @click="onRemoveInlineMath">Remove inline math</button>
        <button @click="onInsertBlockMath">Insert block math</button>
        <button @click="onRemoveBlockMath">Remove block math</button>
      </div>
    </div>
    <editor-content :editor="editor" />
  </div>
</template>

<script>
import 'katex/dist/katex.min.css'

import { Mathematics, migrateMathStrings } from '@dibdab/extension-mathematics'
import StarterKit from '@dibdab/starter-kit'
import { Editor, EditorContent } from '@dibdab/vue-3'
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
      extensions: [
        StarterKit,
        Mathematics.configure({
          blockOptions: {
            onClick: (node, pos) => {
              const newCalculation = prompt('Enter new calculation:', node.attrs.latex)
              if (newCalculation) {
                this.editor.chain().setNodeSelection(pos).updateBlockMath({ latex: newCalculation }).focus().run()
              }
            },
          },
          inlineOptions: {
            onClick: (node, pos) => {
              const newCalculation = prompt('Enter new calculation:', node.attrs.latex)
              if (newCalculation) {
                this.editor.chain().setNodeSelection(pos).updateInlineMath({ latex: newCalculation }).focus().run()
              }
            },
          },
        }),
      ],
      onCreate: ({ editor: currentEditor }) => {
        migrateMathStrings(currentEditor)
      },
      content: `
        <h1>
          This editor supports <span data-type="inline-math" data-latex="\\LaTeX"></span> math expressions. And it even supports converting old $\\sub(3*5=15)$ calculations.
        </h1>
        <p>This is a old $\\LaTeX$ calculation string with $3*5=15$ calculations.</p>
        <p>
          Did you know that <span data-type="inline-math" data-latex="3 * 3 = 9"></span>? Isn't that crazy? Also Pythagoras' theorem is <span data-type="inline-math" data-latex="a^2 + b^2 = c^2"></span>.<br />
          Also the square root of 2 is <span data-type="inline-math" data-latex="\\sqrt{2}"></span>. If you want to know more about <span data-type="inline-math" data-latex="\\LaTeX"></span> visit <a href="https://katex.org/docs/supported.html" target="_blank">katex.org</a>.
        </p>
        <code>
          <pre>$\\LaTeX$</pre>
        </code>
        <p>
          Do you want go deeper? Here is a list of all supported functions:
        </p>
        <ul>
          <li><span data-type="inline-math" data-latex="\\sin(x)"></span></li>
          <li><span data-type="inline-math" data-latex="\\cos(x)"></span></li>
          <li><span data-type="inline-math" data-latex="\\tan(x)"></span></li>
          <li><span data-type="inline-math" data-latex="\\log(x)"></span></li>
          <li><span data-type="inline-math" data-latex="\\ln(x)"></span></li>
          <li><span data-type="inline-math" data-latex="\\sqrt{x}"></span></li>
          <li><span data-type="inline-math" data-latex="\\sum_{i=0}^n x_i"></span></li>
          <li><span data-type="inline-math" data-latex="\\int_a^b x^2 dx"></span></li>
          <li><span data-type="inline-math" data-latex="\\frac{1}{x}"></span></li>
          <li><span data-type="inline-math" data-latex="\\binom{n}{k}"></span></li>
          <li><span data-type="inline-math" data-latex="\\sqrt[n]{x}"></span></li>
          <li><span data-type="inline-math" data-latex="\\left(\\frac{1}{x}\\right)"></span></li>
          <li><span data-type="inline-math" data-latex="\\left\\{\\begin{matrix}x&\\text{if }x>0\\\\0&\\text{otherwise}\\end{matrix}\\right."></span></li>
        </ul>
        <p>The math extension also supports block level math nodes:</p>
        <div data-type="block-math" data-latex="\\int_a^b x^2 dx"></div>
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
    onInsertInlineMath() {
      const hasSelection = !this.editor.state.selection.empty
      if (hasSelection) {
        return this.editor.chain().setInlineMath().focus().run()
      }

      const latex = prompt('Enter inline math expression:', '')
      return this.editor.chain().insertInlineMath({ latex }).focus().run()
    },
    onRemoveInlineMath() {
      this.editor.chain().deleteInlineMath().focus().run()
    },
    onInsertBlockMath() {
      const hasSelection = !this.editor.state.selection.empty
      if (hasSelection) {
        return this.editor.chain().setBlockMath().focus().run()
      }

      const latex = prompt('Enter block math expression:', '')
      return this.editor.chain().insertBlockMath({ latex }).focus().run()
    },
    onRemoveBlockMath() {
      this.editor.chain().deleteBlockMath().focus().run()
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
  .tiptap-mathematics-render {
    padding: 0 0.25rem;

    &--editable {
      cursor: pointer;
      transition: background 0.2s;

      &:hover {
        background: #eee;
      }
    }
  }

  .tiptap-mathematics-render {
    border-radius: 0.25rem;

    &[data-type='inline-math'] {
      display: inline-block;
    }

    &[data-type='block-math'] {
      display: block;
      margin: 1rem 0;
      padding: 1rem;
      text-align: center;
    }

    &.inline-math-error,
    &.block-math-error {
      background: var(--red-light);
      color: var(--red);
      border: 1px solid var(--red-dark);
      padding: 0.5rem;
      border-radius: 0.25rem;
    }
  }
}
</style>
