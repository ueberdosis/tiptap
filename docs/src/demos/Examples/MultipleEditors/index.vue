<template>
  <div class="form">
    <div class="form__label">
      Title
    </div>
    <div v-if="title" class="form__item form__item--title">
      <editor-content :editor="title" />
    </div>
    <div class="form__label">
      Tasks
    </div>
    <div v-if="tasks" class="form__item form__item--tasks">
      <editor-content :editor="tasks" />
    </div>
    <div class="form__label">
      Description
    </div>
    <div v-if="description" class="form__item form__item--description">
      <editor-content :editor="description" />
    </div>
  </div>
</template>

<script>
import { Editor } from '@tiptap/core'
import { EditorContent } from '@tiptap/vue'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Collaboration from '@tiptap/extension-collaboration'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'

const ParagraphDocument = Document.extend({
  content: 'paragraph',
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
    }
  },

  mounted() {
    const ydoc = new Y.Doc()

    this.provider = new WebsocketProvider('wss://websocket.tiptap.dev', 'tiptap-multiple-editors-example', ydoc)

    this.title = new Editor({
      extensions: [
        ParagraphDocument,
        Paragraph,
        Text,
        Collaboration.configure({
          document: ydoc,
          field: 'title',
        }),
      ],
    })

    this.tasks = new Editor({
      extensions: [
        TaskListDocument,
        Paragraph,
        Text,
        TaskList,
        CustomTaskItem,
        Collaboration.configure({
          document: ydoc,
          field: 'tasks',
        }),
      ],
    })

    this.description = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        Collaboration.configure({
          document: ydoc,
          field: 'description',
        }),
      ],
    })
  },

  beforeDestroy() {
    this.title.destroy()
    this.tasks.destroy()
    this.description.destroy()
    this.provider.destroy()
  },
}
</script>

<style lang="scss">
.ProseMirror {
  > * + * {
    margin-top: 0.75em;
  }

  ul[data-type="taskList"] {
    list-style: none;
    padding: 0;

    li {
      display: flex;
      align-items: center;

      > input {
        flex: 0 0 auto;
        margin-right: 0.5rem;
      }
    }
  }
}

.form__label {
  color: #868e96;
  text-transform: uppercase;
  font-weight: bold;
  font-size: 0.7rem;
  letter-spacing: 1px;
}

.form__item {
  margin: 0 0 1rem;
  padding: 0.75rem 1rem;
  border-radius: 5px;
  border: 1px solid #e9ecef;

  &--title {
    font-size: 1.6rem;
  }
}
</style>
