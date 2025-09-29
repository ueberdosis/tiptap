import { mergeAttributes, Node } from '@tiptap/core'

export interface TaskListOptions {
  /**
   * The node type name for a task item.
   * @default 'taskItem'
   * @example 'myCustomTaskItem'
   */
  itemTypeName: string

  /**
   * The HTML attributes for a task list node.
   * @default {}
   * @example { class: 'foo' }
   */
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    taskList: {
      /**
       * Toggle a task list
       * @example editor.commands.toggleTaskList()
       */
      toggleTaskList: () => ReturnType
    }
  }
}

/**
 * This extension allows you to create task lists.
 * @see https://www.tiptap.dev/api/nodes/task-list
 */
export const TaskList = Node.create<TaskListOptions>({
  name: 'taskList',

  addOptions() {
    return {
      itemTypeName: 'taskItem',
      HTMLAttributes: {},
    }
  },

  group: 'block list',

  content() {
    return `${this.options.itemTypeName}+`
  },

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

  markdown: {
    isIndenting: true,

    parse: (token, h) => {
      return h.createNode('taskList', {}, h.parseChildren(token.items || []))
    },

    tokenizer: {
      name: 'taskList',
      level: 'block',
      start(src) {
        // Look for the start of a task list item
        return src.match(/^\s*[-+*]\s+\[([ xX])\]\s+/)?.index
      },
      tokenize(src, tokens, lexer) {
        // Parse nested task list structure
        const lines = src.split('\n')
        const items: any[] = []
        let totalRaw = ''
        let i = 0

        while (i < lines.length) {
          const currentLine = lines[i]
          const taskItemMatch = currentLine.match(/^(\s*)([-+*])\s+\[([ xX])\]\s+(.*)$/)

          if (!taskItemMatch) {
            // Not a task item - stop if we have items, otherwise this isn't a task list
            if (items.length > 0) {
              break
            } else if (currentLine.trim() === '') {
              i += 1
              continue
            } else {
              return undefined
            }
          }

          const [, indent, , checkbox, text] = taskItemMatch
          const indentLevel = indent.length
          totalRaw = `${totalRaw}${currentLine}\n`

          // Collect content for this task item (including nested items)
          const taskItemContent = [text] // Start with the main text
          i += 1

          // Look ahead for nested content (indented more than current item)
          while (i < lines.length) {
            const nextLine = lines[i]

            if (nextLine.trim() === '') {
              // Empty line - might be end of nested content
              const nextNonEmptyIndex = lines.slice(i + 1).findIndex(l => l.trim() !== '')
              if (nextNonEmptyIndex === -1) {
                // No more content
                break
              }

              const nextNonEmpty = lines[i + 1 + nextNonEmptyIndex]
              const nextIndent = nextNonEmpty.match(/^(\s*)/)?.[1]?.length || 0

              if (nextIndent > indentLevel) {
                // Nested content continues after empty line
                taskItemContent.push(nextLine)
                totalRaw = `${totalRaw}${nextLine}\n`
                i += 1
                continue
              } else {
                // End of nested content
                break
              }
            }

            const nextIndent = nextLine.match(/^(\s*)/)?.[1]?.length || 0

            if (nextIndent > indentLevel) {
              // This is nested content for the current task item
              taskItemContent.push(nextLine)
              totalRaw = `${totalRaw}${nextLine}\n`
              i += 1
            } else {
              // Same or less indentation - this belongs to parent level
              break
            }
          }

          // Parse the task item content (text + any nested content)
          const taskItemText = taskItemContent[0]
          const nestedContent = taskItemContent.slice(1)

          // Create the task item
          const taskItem: any = {
            type: 'taskItem',
            checked: checkbox.toLowerCase() === 'x',
            text: taskItemText,
            tokens: lexer.inlineTokens(taskItemText),
          }

          // If there's nested content, parse it
          if (nestedContent.length > 0) {
            // Remove the base indentation from nested content
            const dedentedNested = nestedContent
              .map(nestedLine => nestedLine.slice(indentLevel + 2)) // Remove base indent + 2 spaces
              .join('\n')

            if (dedentedNested.trim()) {
              taskItem.nestedContent = dedentedNested
              taskItem.nestedTokens = lexer.blockTokens(dedentedNested)
            }
          }

          items.push(taskItem)
        }

        if (items.length === 0) {
          return undefined
        }

        return {
          type: 'taskList',
          raw: totalRaw.trim(),
          items,
        }
      },
    },

    render: (node, h) => {
      if (!node.content) {
        return ''
      }

      return h.renderChildren(node.content, '\n')
    },
  },

  addCommands() {
    return {
      toggleTaskList:
        () =>
        ({ commands }) => {
          return commands.toggleList(this.name, this.options.itemTypeName)
        },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-9': () => this.editor.commands.toggleTaskList(),
    }
  },
})
