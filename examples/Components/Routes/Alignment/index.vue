<template>
  <div class="editor">
    <editor-menu-bar :editor="editor" v-slot="{ commands, isActive }">
      <div class="menubar">

        <button
          class="menubar__button"
          :class="{ 'is-active': isActive.bold() }"
          @click="commands.bold"
        >
          <icon name="bold" />
        </button>

        <button
          class="menubar__button"
          :class="{ 'is-active': isActive.italic() }"
          @click="commands.italic"
        >
          <icon name="italic" />
        </button>

        <button
          class="menubar__button"
          :class="{ 'is-active': isActive.strike() }"
          @click="commands.strike"
        >
          <icon name="strike" />
        </button>

        <button
          class="menubar__button"
          :class="{ 'is-active': isActive.underline() }"
          @click="commands.underline"
        >
          <icon name="underline" />
        </button>

        <button
          class="menubar__button"
          :class="{ 'is-active': isActive.code() }"
          @click="commands.code"
        >
          <icon name="code" />
        </button>

        <button
          class="menubar__button"
          :class="{ 'is-active': isActive.paragraph() }"
          @click="commands.paragraph"
        >
          <icon name="paragraph" />
        </button>

        <button
          class="menubar__button"
          :class="{ 'is-active': isActive.heading({ level: 1 }) }"
          @click="commands.heading({ level: 1 })"
        >
          H1
        </button>

        <button
          class="menubar__button"
          :class="{ 'is-active': isActive.heading({ level: 2 }) }"
          @click="commands.heading({ level: 2 })"
        >
          H2
        </button>

        <button
          class="menubar__button"
          :class="{ 'is-active': isActive.heading({ level: 3 }) }"
          @click="commands.heading({ level: 3 })"
        >
          H3
        </button>

        <button
          class="menubar__button"
          :class="{ 'is-active': isActive.alignment({ align: 'left' }) }"
          @click="commands.alignment({ align: 'left' })"
        >
          <icon name="align_left" />
        </button>

        <button
          class="menubar__button"
          :class="{ 'is-active': isActive.alignment({ align: 'center' }) }"
          @click="commands.alignment({ align: 'center' })"
        >
          <icon name="align_center" />
        </button>

        <button
          class="menubar__button"
          :class="{ 'is-active': isActive.alignment({ align: 'right' }) }"
          @click="commands.alignment({ align: 'right' })"
        >
          <icon name="align_right" />
        </button>

        <button
          class="menubar__button"
          :class="{ 'is-active': isActive.alignment({ align: 'justify' }) }"
          @click="commands.alignment({ align: 'justify' })"
        >
          <icon name="align_justify" />
        </button>

        <button
          class="menubar__button"
          :class="{ 'is-active': isActive.bullet_list() }"
          @click="commands.bullet_list"
        >
          <icon name="ul" />
        </button>

        <button
          class="menubar__button"
          :class="{ 'is-active': isActive.ordered_list() }"
          @click="commands.ordered_list"
        >
          <icon name="ol" />
        </button>

        <button
          class="menubar__button"
          :class="{ 'is-active': isActive.blockquote() }"
          @click="commands.blockquote"
        >
          <icon name="quote" />
        </button>

        <button
          class="menubar__button"
          :class="{ 'is-active': isActive.code_block() }"
          @click="commands.code_block"
        >
          <icon name="code" />
        </button>

        <button
          class="menubar__button"
          @click="commands.undo"
        >
          <icon name="undo" />
        </button>

        <button
          class="menubar__button"
          @click="commands.redo"
        >
          <icon name="redo" />
        </button>

        <button
          class="menubar__button"
          @click="commands.createTable({rowsCount: 3, colsCount: 3, withHeaderRow: false })"
        >
          <icon name="table" />
        </button>

        <span v-if="isActive.table()">
          <button
            class="menubar__button"
            @click="commands.deleteTable"
          >
            <icon name="delete_table" />
          </button>
          <button
            class="menubar__button"
            @click="commands.addColumnBefore"
          >
            <icon name="add_col_before" />
          </button>
          <button
            class="menubar__button"
            @click="commands.addColumnAfter"
          >
            <icon name="add_col_after" />
          </button>
          <button
            class="menubar__button"
            @click="commands.deleteColumn"
          >
            <icon name="delete_col" />
          </button>
          <button
            class="menubar__button"
            @click="commands.addRowBefore"
          >
            <icon name="add_row_before" />
          </button>
          <button
            class="menubar__button"
            @click="commands.addRowAfter"
          >
            <icon name="add_row_after" />
          </button>
          <button
            class="menubar__button"
            @click="commands.deleteRow"
          >
            <icon name="delete_row" />
          </button>
          <button
            class="menubar__button"
            @click="commands.toggleCellMerge"
          >
            <icon name="combine_cells" />
          </button>
        </span>

      </div>
    </editor-menu-bar>

    <editor-content class="editor__content" :editor="editor" />
  </div>
</template>

<script>
import Icon from 'Components/Icon'
import { Editor, EditorContent, EditorMenuBar } from 'tiptap'
import {
  Blockquote,
  CodeBlock,
  HardBreak,
  Heading,
  OrderedList,
  BulletList,
  ListItem,
  TodoItem,
  TodoList,
  Bold,
  Code,
  Italic,
  Link,
  Strike,
  Underline,
  Alignment,
  History,
  Table,
  TableHeader,
  TableCell,
  TableRow,
} from 'tiptap-extensions'

export default {
  components: {
    EditorContent,
    EditorMenuBar,
    Icon,
  },
  data() {
    return {
      editor: new Editor({
        extensions: [
          new Blockquote(),
          new BulletList(),
          new CodeBlock(),
          new HardBreak(),
          new Heading({ levels: [1, 2, 3] }),
          new ListItem(),
          new OrderedList(),
          new TodoItem(),
          new TodoList(),
          new Link(),
          new Bold(),
          new Code(),
          new Italic(),
          new Strike(),
          new Underline(),
          new Alignment(),
          new History(),
          new Table({
            resizable: true,
          }),
          new TableHeader(),
          new TableCell(),
          new TableRow(),
        ],
        content: `
          <h2 style="text-align: center;">
            Alignment
          </h2>
          <p>
            This is a very <em>basic</em> example of tiptap.
          </p>
          <pre><code>body { display: none; }</code></pre>
          <blockquote>
            It's amazing 👏
            <br />
            – mom
          </blockquote>
          <table>
            <tr>
              <th colspan="3" data-colwidth="100,0,0" style="text-align: center;">Wide header</th>
            </tr>
            <tr>
              <td>One</td>
              <td>Two</td>
              <td>
                <ul>
                  <li style="text-align: right;">
                    A regular list
                  </li>
                  <li style="text-align: right;">
                    With regular items
                  </li>
                </ul>
              </td>
            </tr>
            <tr>
              <td>Four</td>
              <td>Five</td>
              <td>Six</td>
            </tr>
          </table>
        `,
      }),
    }
  },
  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>
