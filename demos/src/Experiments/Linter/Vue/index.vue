<template>
  <div>
    <editor-content :editor="editor" />
  </div>
</template>

<script>
import Document from '@tiptap/extension-document'
import Heading from '@tiptap/extension-heading'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { Editor, EditorContent } from '@tiptap/vue-3'

import Linter, { BadWords, HeadingLevel, Punctuation } from './extension/index.ts'

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
        Document,
        Paragraph,
        Heading,
        Text,
        Linter.configure({
          plugins: [
            BadWords,
            Punctuation,
            HeadingLevel,
          ],
        }),
      ],
      content: `
        <h1>
          Lint example
        </h1>
        <p>
          This is a sentence ,but the comma clearly isn't in the right place.
        </p>
        <h3>
          Too-minor header
        </h3>
        <p>
          You can hover over the icons on the right to see what the problem is, click them to select the relevant text, and, obviously, double-click them to automatically fix it (if supported).
        </ul>
      `,
    })
  },

  beforeUnmount() {
    this.editor.destroy()
  },
}
</script>

<style lang="scss">/* Basic editor styles */
.tiptap {
  padding-right: 1.25rem;

  :first-child {
    margin-top: 0;
  }

  /* Heading styles */
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    line-height: 1.1;
    margin-top: 2.5rem;
    text-wrap: pretty;
  }

  h1,
  h2 {
    margin-top: 3.5rem;
    margin-bottom: 1.5rem;
  }

  h1 {
    font-size: 1.4rem;
  }

  h2 {
    font-size: 1.2rem;
  }

  h3 {
    font-size: 1.1rem;
  }

  h4,
  h5,
  h6 {
    font-size: 1rem;
  }

  .problem {
    background: #fdd;
    border-bottom: 1px solid #f22;
    margin-bottom: -1px;
  }

  .lint-icon {
    background: #f22;
    border-radius: 100%;
    color: white;
    cursor: pointer;
    display: inline-block;
    font-family: times, georgia, serif;
    font-size: 15px;
    font-weight: bold;
    height: 1.1em;
    line-height: 1.1em;
    padding-left: 0.5px;
    position: absolute;
    right: 2px;
    text-align: center;
    width: 1.1em;
  }

  .lint-icon:before {
    content: "!";
  }
}
</style>
