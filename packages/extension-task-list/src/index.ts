import { Command, createNode, mergeAttributes } from '@tiptap/core'

export interface TaskListOptions {
  HTMLAttributes: {
    [key: string]: any
  },
}

const TaskList = createNode({
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
      taskList: (): Command => ({ commands }) => {
        return commands.toggleList('taskList', 'taskItem')
      },
    }
  },
})

export default TaskList

declare module '@tiptap/core' {
  interface AllExtensions {
    TaskList: typeof TaskList,
  }
}
