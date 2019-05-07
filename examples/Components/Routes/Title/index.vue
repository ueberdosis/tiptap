<template>
  <div class="editor">
    <editor-menu-bar :editor="editor">
      <div class="menubar" slot-scope="{ commands, isActive }">

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
            @click="commands.horizontal_rule"
        >
          <icon name="hr" />
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

      </div>
    </editor-menu-bar>

    <editor-content class="editor__content" :editor="editor" />
    <hr>
    <div class="title-settings">
      <p>
        <label for="title-placeholder">Enter a placeholder for the title</label>
        <input
                type="text"
                id="title-placeholder"
                v-model="editor.extensions.options.title.titlePlaceholder"
        >
      </p>
      <p>
        <label for="subtitle-placeholder">Enter a placeholder for the subtitle</label>
        <input
                type="text"
                id="subtitle-placeholder"
                v-model="editor.extensions.options.title.paragraphPlaceholder"
        >
      </p>
      <p>Your title is: <br>
        <b>{{ getTitle }}</b>
      </p>
      <p>Your subtitle is: <br>
        <b>{{ getSubtitle }}</b>
      </p>
    </div>
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
    Title,
  } from 'tiptap-extensions'

  export default {
    components: {
      EditorContent,
      EditorMenuBar,
      Icon,
    },
    data() {
      const defaultContent = {
        type: 'doc',
        content: [
          {
            type: 'title',
          },
          {
            type: 'paragraph',
          },
        ],
      }

      return {
        defaultContent,
        editor: new Editor({
          extensions: [
            new Blockquote(),
            new BulletList(),
            new CodeBlock(),
            new HardBreak(),
            new Heading({ levels: [1, 2, 3] }),
            new HorizontalRule(),
            new ListItem(),
            new OrderedList(),
            new TodoItem(),
            new TodoList(),
            new Bold(),
            new Code(),
            new Italic(),
            new Link(),
            new Strike(),
            new Underline(),
            new History(),
            new Title({
              emptyClass: 'is-empty',
              titlePlaceholder: 'Write a title',
              paragraphPlaceholder: 'Great thoughts starts here...',
              headingClass: 'article-title',
            }),
          ],
          emptyDocument: this.defaultContent,
        }),
      }
    },
    beforeDestroy() {
      this.editor.destroy()
    },
    mounted() {
      this.editor.setContent(this.defaultContent)
    },
    computed: {
      getTitle() {
        try {
          return this.editor.state.doc.firstChild.content.content[0].text
        } catch (error) {
          return ''
        }
      },
      getSubtitle() {
        try {
          return this.editor.state.doc.maybeChild(1).content.content[0].text
        } catch (error) {
          return ''
        }
      },
    },
  }
</script>
<style lang="scss">
  .editor input {
    padding: 3px 5px;
    font-size: 12px;
    width: 100%;
  }
  .editor .is-empty:before {
    content: attr(data-placeholder);
    float: left;
    color: #aaa;
    pointer-events: none;
    height: 0;
    font-style: italic;
  }
  .editor hr {
    margin: 10px 0;
  }
  .editor .title-settings {
    background-color: rgba(0, 0, 0, 0.05);
    color: rgba(0, 0, 0, 0.7);
    padding: 1rem;
    border-radius: 6px;
    margin-bottom: 1.5rem;
    font-style: italic;
  }
</style>
