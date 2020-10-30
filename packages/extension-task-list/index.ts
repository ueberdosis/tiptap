import { Command, createNode, mergeAttributes } from '@tiptap/core'

const TaskList = createNode({
  name: 'task_list',

  list: true,

  group: 'block',

  content: 'task_item+',

  parseHTML() {
    return [
      {
        tag: 'ul[data-type="task_list"]',
        priority: 51,
      },
    ]
  },

  renderHTML({ attributes }) {
    return ['ul', mergeAttributes(attributes, { 'data-type': 'task_list' }), 0]
  },

  addCommands() {
    return {
      taskList: (): Command => ({ commands }) => {
        return commands.toggleList('task_list', 'task_item')
      },
    }
  },
})

export default TaskList

declare module '@tiptap/core/src/Editor' {
  interface AllExtensions {
    TaskList: typeof TaskList,
  }
}
