<template>
  <div v-if="editor">
    <button @click="addCapturedTable">
      add table
    </button>
    <button @click="addCapturedImage">
      add image
    </button>
    <button @click="removeCapturedTable">
      remove table
    </button>
    <button @click="removeCapturedImage">
      remove image
    </button>
    <editor-content :editor="editor" />
  </div>
</template>

<script>
import { Editor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import { Figure } from './figure'
import { Figcaption } from './figcaption'

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
                  text: 'image caption',
                },
              ],
            },
            {
              type: 'image',
              attrs: {
                src: 'https://source.unsplash.com/K9QHL52rE2k/800x400',
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
                  text: 'table caption',
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
                              text: 'cell 1',
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
                              text: 'cell 2',
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
          <img src="https://source.unsplash.com/8xznAGy4HcY/800x400" alt="Random photo of something" title="Who’s dat?">
        </figure>
        <p>Some text</p>
        <img src="https://source.unsplash.com/K9QHL52rE2k/800x400">
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
                <td>singer</td>
                <td>songwriter</td>
                <td>actress</td>
              </tr>
              <tr>
                <td>Philipp Kühn</td>
                <td>designer</td>
                <td>developer</td>
                <td>maker</td>
              </tr>
              <tr>
                <td>Hans Pagel</td>
                <td>wrote this</td>
                <td colspan="2">that’s it</td>
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
              <td>singer</td>
              <td>songwriter</td>
              <td>actress</td>
            </tr>
            <tr>
              <td>Philipp Kühn</td>
              <td>designer</td>
              <td>developer</td>
              <td>maker</td>
            </tr>
            <tr>
              <td>Hans Pagel</td>
              <td>wrote this</td>
              <td colspan="2">that’s it</td>
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
.ProseMirror {
  > * + * {
    margin-top: 0.75em;
  }

  figure {
    max-width: 25rem;
    border: 3px solid #0D0D0D;
    border-radius: 0.5rem;
    margin: 1rem 0;
    padding: 0.5rem;
  }

  figcaption {
    margin: 0.25rem 0;
    text-align: center;
    padding: 0.5rem;
    border: 2px dashed #0D0D0D20;
    border-radius: 0.5rem;

    &:first-child {
      margin-top: 0;
    }

    &:last-child {
      margin-bottom: 0;
    }
  }

  img {
    display: block;
    max-width: min(100%, 25rem);
    height: auto;
    border-radius: 0.5rem;
  }

  table {
    border-collapse: collapse;
    table-layout: fixed;
    width: 100%;
    margin: 0;
    overflow: hidden;

    td,
    th {
      min-width: 1em;
      border: 2px solid #ced4da;
      padding: 3px 5px;
      vertical-align: top;
      box-sizing: border-box;
      position: relative;

      > * {
        margin-bottom: 0;
      }
    }

    th {
      font-weight: bold;
      text-align: left;
      background-color: #f1f3f5;
    }

    .selectedCell:after {
      z-index: 2;
      position: absolute;
      content: "";
      left: 0; right: 0; top: 0; bottom: 0;
      background: rgba(200, 200, 255, 0.4);
      pointer-events: none;
    }

    .column-resize-handle {
      position: absolute;
      right: -2px;
      top: 0;
      bottom: -2px;
      width: 4px;
      background-color: #adf;
      pointer-events: none;
    }
  }
}
</style>
