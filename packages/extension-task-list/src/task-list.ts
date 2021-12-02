import { Node, mergeAttributes } from '@tiptap/core'

export interface TaskListOptions {
  HTMLAttributes: Record<string, any>,
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    taskList: {
      /**
       * Toggle a task list
       */
      toggleTaskList: () => ReturnType,
    }
  }
}

export const TaskList = Node.create<TaskListOptions>({
  name: 'taskList',

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  group: 'block list',

  content: 'taskItem+',

  parseHTML() {
    return [
      {
        tag: `ul[data-type="${this.name}"]`,
        priority: 51,
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['ul', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { 'data-type': this.name }), 0]
  },

  addCommands() {
    return {
      toggleTaskList: () => ({ commands }) => {
        return commands.toggleList(this.name, 'taskItem')
      },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-9': () => this.editor.commands.toggleTaskList(),
    }
  },
})
