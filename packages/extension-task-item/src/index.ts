import { createNode, mergeAttributes } from '@tiptap/core'
import { wrappingInputRule } from 'prosemirror-inputrules'

export const inputRegex = /^\s*(\[([ |x])\])\s$/

export interface TaskItemOptions {
  nested: boolean,
}

const TaskItem = createNode({
  name: 'taskItem',

  content() {
    return this.options.nested ? '(paragraph|taskList)+' : 'paragraph+'
  },

  defining: true,

  defaultOptions: <TaskItemOptions>{
    nested: false,
  },

  addAttributes() {
    return {
      checked: {
        default: false,
        parseHTML: element => ({
          checked: element.getAttribute('data-checked') === 'true',
        }),
        renderHTML: attributes => ({
          'data-checked': attributes.checked,
        }),
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'li[data-type="taskItem"]',
        priority: 51,
      },
    ]
  },

  renderHTML({ attributes }) {
    return ['li', mergeAttributes(attributes, { 'data-type': 'taskItem' }), 0]
  },

  addKeyboardShortcuts() {
    const shortcuts = {
      Enter: () => this.editor.splitListItem('taskItem'),
      'Shift-Tab': () => this.editor.liftListItem('taskItem'),
    }

    if (!this.options.nested) {
      return shortcuts
    }

    return {
      ...shortcuts,
      Tab: () => this.editor.sinkListItem('taskItem'),
    }
  },

  addNodeView() {
    return ({ attributes, getPos, editor }) => {
      const { view } = editor
      const listItem = document.createElement('li')
      const checkbox = document.createElement('input')
      const content = document.createElement('div')

      checkbox.type = 'checkbox'
      checkbox.addEventListener('change', event => {
        const { checked } = event.target as any

        if (typeof getPos === 'function') {
          view.dispatch(view.state.tr.setNodeMarkup(getPos(), undefined, {
            checked,
          }))
          editor.focus()
        }
      })

      if (attributes['data-checked'] === true) {
        checkbox.setAttribute('checked', 'checked')
      }

      listItem.append(checkbox, content)

      Object.entries(attributes).forEach(([key, value]) => {
        listItem.setAttribute(key, value)
      })

      return {
        dom: listItem,
        contentDOM: content,
        update: node => {
          if (node.type !== this.type) {
            return false
          }

          return true
        },
      }
    }
  },

  addInputRules() {
    return [
      wrappingInputRule(
        inputRegex,
        this.type,
        match => ({
          checked: match[match.length - 1] === 'x',
        }),
      ),
    ]
  },
})

export default TaskItem

declare module '@tiptap/core' {
  interface AllExtensions {
    TaskItem: typeof TaskItem,
  }
}
