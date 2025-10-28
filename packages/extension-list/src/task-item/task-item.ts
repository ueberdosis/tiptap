import type { KeyboardShortcutCommand } from '@tiptap/core'
import { mergeAttributes, Node, renderNestedMarkdownContent, wrappingInputRule } from '@tiptap/core'
import type { Node as ProseMirrorNode } from '@tiptap/pm/model'

export interface TaskItemOptions {
  /**
   * A callback function that is called when the checkbox is clicked while the editor is in readonly mode.
   * @param node The prosemirror node of the task item
   * @param checked The new checked state
   * @returns boolean
   */
  onReadOnlyChecked?: (node: ProseMirrorNode, checked: boolean) => boolean

  /**
   * Controls whether the task items can be nested or not.
   * @default false
   * @example true
   */
  nested: boolean

  /**
   * HTML attributes to add to the task item element.
   * @default {}
   * @example { class: 'foo' }
   */
  HTMLAttributes: Record<string, any>

  /**
   * The node type for taskList nodes
   * @default 'taskList'
   * @example 'myCustomTaskList'
   */
  taskListTypeName: string

  /**
   * Accessibility options for the task item.
   * @default {}
   * @example
   * ```js
   * {
   *   checkboxLabel: (node) => `Task item: ${node.textContent || 'empty task item'}`
   * }
   */
  a11y?: {
    checkboxLabel?: (node: ProseMirrorNode, checked: boolean) => string
  }
}

/**
 * Matches a task item to a - [ ] on input.
 */
export const inputRegex = /^\s*(\[([( |x])?\])\s$/

/**
 * This extension allows you to create task items.
 * @see https://www.tiptap.dev/api/nodes/task-item
 */
export const TaskItem = Node.create<TaskItemOptions>({
  name: 'taskItem',

  addOptions() {
    return {
      nested: false,
      HTMLAttributes: {},
      taskListTypeName: 'taskList',
      a11y: undefined,
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
        parseHTML: element => {
          const dataChecked = element.getAttribute('data-checked')

          return dataChecked === '' || dataChecked === 'true'
        },
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
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': this.name,
      }),
      [
        'label',
        [
          'input',
          {
            type: 'checkbox',
            checked: node.attrs.checked ? 'checked' : null,
          },
        ],
        ['span'],
      ],
      ['div', 0],
    ]
  },

  parseMarkdown: (token, h) => {
    // Parse the task item's text content into paragraph content
    const content = []

    // First, add the main paragraph content
    if (token.tokens && token.tokens.length > 0) {
      // If we have tokens, create a paragraph with the inline content
      content.push(h.createNode('paragraph', {}, h.parseInline(token.tokens)))
    } else if (token.text) {
      // If we have raw text, create a paragraph with text node
      content.push(h.createNode('paragraph', {}, [h.createNode('text', { text: token.text })]))
    } else {
      // Fallback: empty paragraph
      content.push(h.createNode('paragraph', {}, []))
    }

    // Then, add any nested content (like nested task lists)
    if (token.nestedTokens && token.nestedTokens.length > 0) {
      const nestedContent = h.parseChildren(token.nestedTokens)
      content.push(...nestedContent)
    }

    return h.createNode('taskItem', { checked: token.checked || false }, content)
  },

  renderMarkdown: (node, h) => {
    const checkedChar = node.attrs?.checked ? 'x' : ' '
    const prefix = `- [${checkedChar}] `

    return renderNestedMarkdownContent(node, h, prefix)
  },

  addKeyboardShortcuts() {
    const shortcuts: {
      [key: string]: KeyboardShortcutCommand
    } = {
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
    return ({ node, HTMLAttributes, getPos, editor }) => {
      const listItem = document.createElement('li')
      const checkboxWrapper = document.createElement('label')
      const checkboxStyler = document.createElement('span')
      const checkbox = document.createElement('input')
      const content = document.createElement('div')

      const updateA11Y = (currentNode: ProseMirrorNode) => {
        checkbox.ariaLabel =
          this.options.a11y?.checkboxLabel?.(currentNode, checkbox.checked) ||
          `Task item checkbox for ${currentNode.textContent || 'empty task item'}`
      }

      updateA11Y(node)

      checkboxWrapper.contentEditable = 'false'
      checkbox.type = 'checkbox'
      checkbox.addEventListener('mousedown', event => event.preventDefault())
      checkbox.addEventListener('change', event => {
        // if the editor isn’t editable and we don't have a handler for
        // readonly checks we have to undo the latest change
        if (!editor.isEditable && !this.options.onReadOnlyChecked) {
          checkbox.checked = !checkbox.checked

          return
        }

        const { checked } = event.target as any

        if (editor.isEditable && typeof getPos === 'function') {
          editor
            .chain()
            .focus(undefined, { scrollIntoView: false })
            .command(({ tr }) => {
              const position = getPos()

              if (typeof position !== 'number') {
                return false
              }
              const currentNode = tr.doc.nodeAt(position)

              tr.setNodeMarkup(position, undefined, {
                ...currentNode?.attrs,
                checked,
              })

              return true
            })
            .run()
        }
        if (!editor.isEditable && this.options.onReadOnlyChecked) {
          // Reset state if onReadOnlyChecked returns false
          if (!this.options.onReadOnlyChecked(node, checked)) {
            checkbox.checked = !checkbox.checked
          }
        }
      })

      Object.entries(this.options.HTMLAttributes).forEach(([key, value]) => {
        listItem.setAttribute(key, value)
      })

      listItem.dataset.checked = node.attrs.checked
      checkbox.checked = node.attrs.checked

      checkboxWrapper.append(checkbox, checkboxStyler)
      listItem.append(checkboxWrapper, content)

      Object.entries(HTMLAttributes).forEach(([key, value]) => {
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
          checkbox.checked = updatedNode.attrs.checked
          updateA11Y(updatedNode)

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
