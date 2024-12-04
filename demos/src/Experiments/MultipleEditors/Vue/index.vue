<template>
  <div class="container">
    <div class="multi-editor-group">
      <div class="form">
        <label class="label-large">Title</label>
        <div v-if="title" class="form__item">
          <editor-content :editor="title" />
        </div>
      </div>
      <div class="form">
        <label class="label-large">Tasks</label>
        <div v-if="tasks" class="form__item">
          <editor-content :editor="tasks" />
        </div>
      </div>
      <div class="form">
        <label class="label-large">Description</label>
        <div v-if="description" class="form__item">
          <editor-content :editor="description" />
        </div>
      </div>
    </div>
  </div>

  <div class="output-group">
    <label>JSON</label>
    <code>{{ json }}</code>
  </div>
</template>

<script>
import Bold from '@tiptap/extension-bold'
import Collaboration from '@tiptap/extension-collaboration'
import Document from '@tiptap/extension-document'
import DropCursor from '@tiptap/extension-dropcursor'
import Heading from '@tiptap/extension-heading'
import Paragraph from '@tiptap/extension-paragraph'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import Text from '@tiptap/extension-text'
import { Editor, EditorContent } from '@tiptap/vue-3'
import { yDocToProsemirrorJSON } from 'y-prosemirror'
import * as Y from 'yjs'

const HeadingDocument = Document.extend({
  content: 'heading',
})

const TaskListDocument = Document.extend({
  content: 'taskList',
})

const CustomTaskItem = TaskItem.extend({
  content: 'text*',
})

export default {
  components: {
    EditorContent,
  },

  data() {
    return {
      title: null,
      tasks: null,
      description: null,
      ydoc: new Y.Doc(),
    }
  },

  mounted() {
    this.title = new Editor({
      extensions: [
        HeadingDocument,
        Heading.configure({
          levels: [2],
        }),
        Text,
        Bold,
        DropCursor,
        Collaboration.configure({
          document: this.ydoc,
          field: 'title',
        }),
      ],
      content: '<h2>No matter what you do, this will be a single heading.</h2>',
    })

    this.tasks = new Editor({
      extensions: [
        TaskListDocument,
        Paragraph,
        Text,
        Bold,
        DropCursor,
        TaskList,
        CustomTaskItem,
        Collaboration.configure({
          document: this.ydoc,
          field: 'tasks',
        }),
      ],
      content: `
        <ul data-type="taskList">
          <li data-type="taskItem" data-checked="true">And this</li>
          <li data-type="taskItem" data-checked="false">is a task list</li>
          <li data-type="taskItem" data-checked="false">and only a task list.</li>
        </ul>
      `,
    })

    this.description = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        Bold,
        DropCursor,
        Collaboration.configure({
          document: this.ydoc,
          field: 'description',
        }),
      ],
      content: `
        <p>
          <strong>Lengthy text</strong>
        </p>
        <p>
          This can be lengthy text.
        </p>
      `,
    })
  },

  computed: {
    json() {
      return {
        title: yDocToProsemirrorJSON(this.ydoc, 'title'),
        tasks: yDocToProsemirrorJSON(this.ydoc, 'tasks'),
        description: yDocToProsemirrorJSON(this.ydoc, 'description'),
      }
    },
  },

  beforeUnmount() {
    this.title.destroy()
    this.tasks.destroy()
    this.description.destroy()
    this.provider.destroy()
  },
}
</script>

<style lang="scss">

/* Basic editor styles */
.tiptap {
  :first-child {
    margin-top: 0;
  }

  /* Heading style */
  h2 {
    font-size: 1.2rem;
    margin-bottom: 1.5rem;
    margin-top: 3.5rem;
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

  /* Task list specific styles */
  ul[data-type="taskList"] {
    list-style: none;
    margin-left: 0;
    padding: 0;

    li {
      align-items: flex-start;
      display: flex;

      > label {
        flex: 0 0 auto;
        margin-right: 0.5rem;
        user-select: none;
      }

      > div {
        flex: 1 1 auto;
      }
    }

    input[type="checkbox"] {
      cursor: pointer;
    }

    ul[data-type="taskList"] {
      margin: 0;
    }
  }
}

/* Multi editor form group */
.multi-editor-group {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin: 1.5rem;

  .form {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    .form__item {
      border-radius: 5px;
      border: 1px solid var(--gray-3);
      transition: .1s all ease-in-out;

      &:hover {
        border-color: var(--purple);
      }
    }
  }
}
</style>
