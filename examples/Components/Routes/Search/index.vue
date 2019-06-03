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

        <span
            class="menubar__button"
            @click="editor.commands.toggleSearch"
        >
          Search
          <div
              class="search-modal"
              @click.stop
              v-if="editor.extensions.options.search.searching"
          >
            <input
                ref="search"
                @keydown.enter.prevent="editor.commands.find(searchTerm)"
                placeholder="Search..."
                type="text"
                v-model="searchTerm"
            ><input
              @keydown.enter.prevent="editor.commands.replace(replaceWith)"
              placeholder="Replace..."
              type="text"
              v-model="replaceWith"
          >
            <button @click="editor.commands.find(searchTerm)">Find</button>
            <button @click="editor.commands.clearSearch()">Clear</button>
            <button @click="editor.commands.replace(replaceWith)">Replace</button>
            <button @click="editor.commands.replaceAll(replaceWith)">Replace All</button>
          </div>
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
  HorizontalRule,
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
  History,
  Search,
} from 'tiptap-extensions'

export default {
  components: {
    EditorContent,
    EditorMenuBar,
    Icon,
  },
  data() {
    return {
      searching: false,
      searchTerm: null,
      replaceWith: null,
      editor: new Editor({
        extensions: [
          new Blockquote(),
          new BulletList(),
          new CodeBlock(),
          new HardBreak(),
          new Heading({ levels: [1, 2, 3] }),
          new HorizontalRule(),
          new Search({
            disableRegex: false,
          }),
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
          new History(),
        ],
        onUpdate: ({ getJSON }) => {
          this.json = getJSON()
        },
        onToggleSearch: searching => {
          this.$nextTick(() => {
            if (searching) {
              this.$refs.search.focus()
            }
          })
        },
        content: `
          <h2>
            Hi there,
          </h2>
          <p>
            this is a very <em>basic</em> example of tiptap.
          </p>
          <pre><code>body { display: none; }</code></pre>
          <ul>
            <li>
              A regular list
            </li>
            <li>
              With regular items
            </li>
          </ul>
          <blockquote>
            It's amazing 👏
            <br />
            – mom
          </blockquote>
        `,
      }),
    }
  },
  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>

<style>
  .menubar__button {
    position: relative;
  }

  .search-modal {
    position: absolute;
    top: 100%;
    display: flex;
    background: #fff;
    padding: .5em;
    box-shadow: 0 2px 4px #0003;
    border-radius: 2px;
    left: 0;
    margin-top: 0.25em;
    border: solid 2px;
  }

  .find {
    background: rgba(255, 213, 0, 0.5);
  }
</style>
