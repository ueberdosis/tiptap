import { Node, mergeAttributes, wrappingInputRule } from '@tiptap/core'

export interface TaskItemOptions {
  nested: boolean,
  HTMLAttributes: Record<string, any>,
}

export const inputRegex = /^\s*(\[([ |x])\])\s$/

export const TaskItem = Node.create<TaskItemOptions>({
  name: 'taskItem',

  addOptions() {
    return {
      nested: false,
      HTMLAttributes: {},
    }
  },

  content() {
    return this.options.nested ? 'paragraph block*' : 'paragraph+'
  },

  defining: true,

  addAttributes() {
    return {
      checked: {
        default: false,
        keepOnSplit: false,
        parseHTML: element => element.getAttribute('data-checked') === 'true',
        renderHTML: attributes => ({
          'data-checked': attributes.checked,
        }),
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: `li[data-type="${this.name}"]`,
        priority: 51,
      },
    ]
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'li',
      mergeAttributes(
        this.options.HTMLAttributes,
        HTMLAttributes,
        { 'data-type': this.name },
      ),
      [
        'label',
        [
          'input',
          {
            type: 'checkbox',
            checked: node.attrs.checked
              ? 'checked'
              : null,
          },
        ],
        ['span'],
      ],
      [
        'div',
        0,
      ],
    ]
  },

  addKeyboardShortcuts() {
    const shortcuts = {
      Enter: () => this.editor.commands.splitListItem(this.name),
      'Shift-Tab': () => this.editor.commands.liftListItem(this.name),
    }

    if (!this.options.nested) {
      return shortcuts
    }

    return {
      ...shortcuts,
      Tab: () => this.editor.commands.sinkListItem(this.name),
    }
  },

  addNodeView() {
    return ({
      node,
      HTMLAttributes,
      getPos,
      editor,
    }) => {
      const listItem = document.createElement('li')
      const checkboxWrapper = document.createElement('label')
      const checkboxStyler = document.createElement('span')
      const checkbox = document.createElement('input')
      const content = document.createElement('div')

      checkboxWrapper.contentEditable = 'false'
      checkbox.type = 'checkbox'
      checkbox.addEventListener('change', event => {
        // if the editor isn’t editable
        // we have to undo the latest change
        if (!editor.isEditable) {
          checkbox.checked = !checkbox.checked

          return
        }

        const { checked } = event.target as any

        if (editor.isEditable && typeof getPos === 'function') {
          editor
            .chain()
            .focus(undefined, { scrollIntoView: false })
            .command(({ tr }) => {
              tr.setNodeMarkup(getPos(), undefined, {
                checked,
              })

              return true
            })
            .run()
        }
      })

      Object.entries(this.options.HTMLAttributes).forEach(([key, value]) => {
        listItem.setAttribute(key, value)
      })

      listItem.dataset.checked = node.attrs.checked
      if (node.attrs.checked) {
        checkbox.setAttribute('checked', 'checked')
      }

      checkboxWrapper.append(checkbox, checkboxStyler)
      listItem.append(checkboxWrapper, content)

      Object
        .entries(HTMLAttributes)
        .forEach(([key, value]) => {
          listItem.setAttribute(key, value)
        })

      return {
        dom: listItem,
        contentDOM: content,
        update: updatedNode => {
          if (updatedNode.type !== this.type) {
            return false
          }

          listItem.dataset.checked = updatedNode.attrs.checked
          if (updatedNode.attrs.checked) {
            checkbox.setAttribute('checked', 'checked')
          } else {
            checkbox.removeAttribute('checked')
          }

          return true
        },
      }
    }
  },

  addInputRules() {
    return [
      wrappingInputRule({
        find: inputRegex,
        type: this.type,
        getAttributes: match => ({
          checked: match[match.length - 1] === 'x',
        }),
      }),
    ]
  },
})
