<template>
  <div v-if="editor" class="container">
    <div class="control-group">
      <div class="button-group">
        <button @click="addCapturedTable">
          Add table with caption
        </button>
        <button @click="addCapturedImage">
          Add image with caption
        </button>
        <button @click="removeCapturedTable">
          Remove table with caption
        </button>
        <button @click="removeCapturedImage">
          Remove image with caption
        </button>
      </div>
    </div>
    <editor-content :editor="editor" />
  </div>
</template>

<script>
import Image from '@tiptap/extension-image'
import Table from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'
import StarterKit from '@tiptap/starter-kit'
import { Editor, EditorContent } from '@tiptap/vue-3'

import { Figcaption } from './figcaption.ts'
import { Figure } from './figure.ts'

const ImageFigure = Figure.extend({
  name: 'capturedImage',
  content: 'figcaption image',
})

const TableFigure = Figure.extend({
  name: 'capturedTable',
  content: 'figcaption table',
})

export default {
  components: {
    EditorContent,
  },

  data() {
    return {
      editor: null,
    }
  },

  methods: {
    addCapturedImage() {
      this.editor
        .chain()
        .focus()
        .insertContent({
          type: 'capturedImage',
          content: [
            {
              type: 'figcaption',
              content: [
                {
                  type: 'text',
                  text: 'Image caption',
                },
              ],
            },
            {
              type: 'image',
              attrs: {
                src: 'https://placehold.co/800x400/orange/white',
              },
            },
          ],
        })
        .run()
    },

    addCapturedTable() {
      this.editor
        .chain()
        .focus()
        .insertContent({
          type: 'capturedTable',
          content: [
            {
              type: 'figcaption',
              content: [
                {
                  type: 'text',
                  text: 'Table caption',
                },
              ],
            },
            {
              type: 'table',
              content: [
                {
                  type: 'tableRow',
                  content: [
                    {
                      type: 'tableCell',
                      content: [
                        {
                          type: 'paragraph',
                          content: [
                            {
                              type: 'text',
                              text: 'Cell 1',
                            },
                          ],
                        },
                      ],
                    },
                    {
                      type: 'tableCell',
                      content: [
                        {
                          type: 'paragraph',
                          content: [
                            {
                              type: 'text',
                              text: 'Cell 2',
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        })
        .run()
    },

    removeCapturedTable() {
      this.editor
        .chain()
        .focus()
        .deleteNode('capturedTable')
        .run()
    },

    removeCapturedImage() {
      this.editor
        .chain()
        .focus()
        .deleteNode('capturedImage')
        .run()
    },
  },

  mounted() {
    this.editor = new Editor({
      extensions: [
        StarterKit,
        Table,
        TableRow,
        TableHeader,
        TableCell,
        ImageFigure,
        TableFigure,
        Figcaption,
        Image,
      ],
      content: `
        <p>Some text</p>
        <figure data-type="capturedImage">
          <figcaption>
            Image caption
          </figcaption>
          <img src="https://placehold.co/800x400/black/white" alt="Random photo of something" title="Who’s dat?">
        </figure>
        <p>Some text</p>
        <img src="https://placehold.co/800x400">
        <p>Some text</p>
        <figure data-type="capturedTable">
          <figcaption>
            Table caption
          </figcaption>
          <table>
            <tbody>
              <tr>
                <th>Name</th>
                <th colspan="3">Description</th>
              </tr>
              <tr>
                <td>Cyndi Lauper</td>
                <td>Singer</td>
                <td>Songwriter</td>
                <td>Actress</td>
              </tr>
              <tr>
                <td>Marie Curie</td>
                <td>Scientist</td>
                <td>Chemist</td>
                <td>Physicist</td>
              </tr>
              <tr>
                <td>Indira Gandhi</td>
                <td>Prime minister</td>
                <td colspan="2">Politician</td>
              </tr>
            </tbody>
          </table>
        </figure>
        <p>Some text</p>
        <table>
          <tbody>
            <tr>
              <th>Name</th>
              <th colspan="3">Description</th>
            </tr>
            <tr>
              <td>Cyndi Lauper</td>
              <td>Singer</td>
              <td>Songwriter</td>
              <td>Actress</td>
            </tr>
            <tr>
              <td>Marie Curie</td>
              <td>Scientist</td>
              <td>Chemist</td>
              <td>Physicist</td>
            </tr>
            <tr>
              <td>Indira Gandhi</td>
              <td>Prime minister</td>
              <td colspan="2">Politician</td>
            </tr>
          </tbody>
        </table>
      `,
    })
  },

  beforeUnmount() {
    this.editor.destroy()
  },
}
</script>

<style lang="scss">
/* Basic editor styles */
.tiptap {
  :first-child {
    margin-top: 0;
  }

  /* List styles */
  ul,
  ol {
    padding: 0 1rem;
    margin: 1.25rem 1rem 1.25rem 0.4rem;

    li p {
      margin-top: 0.25em;
      margin-bottom: 0.25em;
    }
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

  /* Code and preformatted text styles */
  code {
    background-color: var(--purple-light);
    border-radius: 0.4rem;
    color: var(--black);
    font-size: 0.85rem;
    padding: 0.25em 0.3em;
  }

  pre {
    background: var(--black);
    border-radius: 0.5rem;
    color: var(--white);
    font-family: 'JetBrainsMono', monospace;
    margin: 1.5rem 0;
    padding: 0.75rem 1rem;

    code {
      background: none;
      color: inherit;
      font-size: 0.8rem;
      padding: 0;
    }
  }

  blockquote {
    border-left: 3px solid var(--gray-3);
    margin: 1.5rem 0;
    padding-left: 1rem;
  }

  hr {
    border: none;
    border-top: 1px solid var(--gray-2);
    margin: 2rem 0;
  }

  img {
    display: block;
    height: auto;
    margin: 1.5rem 0;
    max-width: 100%;

    &.ProseMirror-selectednode {
      outline: 3px solid var(--purple);
    }
  }

  table {
    border-collapse: collapse;
    margin: 0;
    overflow: hidden;
    table-layout: fixed;
    width: 100%;

    td,
    th {
      border: 1px solid var(--gray-3);
      box-sizing: border-box;
      min-width: 1em;
      padding: 6px 8px;
      position: relative;
      vertical-align: top;

      > * {
        margin-bottom: 0;
      }
    }

    th {
      background-color: var(--gray-1);
      font-weight: bold;
      text-align: left;
    }

    .selectedCell:after {
      background: var(--gray-2);
      content: "";
      left: 0; right: 0; top: 0; bottom: 0;
      pointer-events: none;
      position: absolute;
      z-index: 2;
    }

    .column-resize-handle {
      background-color: var(--purple);
      bottom: -2px;
      pointer-events: none;
      position: absolute;
      right: -2px;
      top: 0;
      width: 4px;
    }
  }

  .tableWrapper {
    margin: 1.5rem 0;
    overflow-x: auto;
  }

  &.resize-cursor {
    cursor: ew-resize;
    cursor: col-resize;
  }

  /* Figure */
  figure {
    align-items: start;
    border: 2px solid var(--black);
    border-radius: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin: 1rem 0;
    padding: 0.5rem;
    width: fit-content;

    > *:not(figcaption) {
      margin: 0;
      max-width: 100%;
    }

    &:has(figcaption:active) {
      border-color: var(--purple);
    }

    figcaption {
      border-radius: 0.5rem;
      border: 2px dashed #0D0D0D20;
      padding: 0.5rem;
      text-align: center;
      width: 100%;
    }
  }
}
</style>
