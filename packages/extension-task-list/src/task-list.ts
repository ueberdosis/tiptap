import { Command, Node, mergeAttributes } from '@tiptap/core'

export interface TaskListOptions {
  HTMLAttributes: {
    [key: string]: any
  },
}

export const TaskList = Node.create({
  name: 'taskList',

  defaultOptions: <TaskListOptions>{
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
      /**
       * Toggle a task list
       */
      toggleTaskList: (): Command => ({ commands }) => {
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

declare module '@tiptap/core' {
  interface AllExtensions {
    TaskList: typeof TaskList,
  }
}
