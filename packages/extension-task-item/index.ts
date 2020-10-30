import { createNode, mergeAttributes } from '@tiptap/core'

export interface TaskItemOptions {
  nested: boolean,
}

const TaskItem = createNode({
  name: 'task_item',

  content: 'paragraph+',

  // TODO: allow content to be a callback function
  // content() {
  //   return this.options.nested ? '(paragraph|todo_list)+' : 'paragraph+',
  // },

  defining: true,

  defaultOptions: <TaskItemOptions>{
    nested: false,
  },

  addAttributes() {
    return {
      done: {
        default: false,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'li[data-type="task_item"]',
        priority: 51,
      },
    ]
  },

  renderHTML({ attributes }) {
    return ['li', mergeAttributes(attributes, { 'data-type': 'task_item' }), 0]
  },

  addKeyboardShortcuts() {
    return {
      Enter: () => this.editor.splitListItem('task_item'),
      Tab: () => this.editor.sinkListItem('task_item'),
      'Shift-Tab': () => this.editor.liftListItem('task_item'),
    }
  },
})

export default TaskItem

declare module '@tiptap/core/src/Editor' {
  interface AllExtensions {
    TaskItem: typeof TaskItem,
  }
}
