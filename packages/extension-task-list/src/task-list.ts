import { Command, Node, mergeAttributes } from '@tiptap/core'

export interface TaskListOptions {
  HTMLAttributes: {
    [key: string]: any
  },
}

declare module '@tiptap/core' {
  interface Commands {
    taskList: {
      /**
       * Toggle a task list
       */
      toggleTaskList: () => Command,
    }
  }
}

export const TaskList = Node.create<TaskListOptions>({
  name: 'taskList',

  defaultOptions: {
    HTMLAttributes: {},
  },

  group: 'block list',

  content: 'taskItem+',

  parseHTML() {
    return [
      {
        tag: 'ul[data-type="taskList"]',
        priority: 51,
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['ul', mergeAttributes(HTMLAttributes, { 'data-type': 'taskList' }), 0]
  },

  addCommands() {
    return {
      toggleTaskList: () => ({ commands }) => {
        return commands.toggleList('taskList', 'taskItem')
      },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-l': () => this.editor.commands.toggleTaskList(),
    }
  },
})
