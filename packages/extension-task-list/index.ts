import { Command, createNode, mergeAttributes } from '@tiptap/core'

const TaskList = createNode({
  name: 'taskList',

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

  renderHTML({ attributes }) {
    return ['ul', mergeAttributes(attributes, { 'data-type': 'taskList' }), 0]
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

declare module '@tiptap/core/src/Editor' {
  interface AllExtensions {
    TaskList: typeof TaskList,
  }
}
