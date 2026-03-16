import { mergeAttributes, Node, parseIndentedBlocks } from '@tiptap/core'

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

  parseMarkdown: (token, h) => {
    return h.createNode('taskList', {}, h.parseChildren(token.items || []))
  },

  renderMarkdown: (node, h) => {
    if (!node.content) {
      return ''
    }

    return h.renderChildren(node.content, '\n')
  },

  markdownTokenizer: {
    name: 'taskList',
    level: 'block',
    start(src) {
      // Look for the start of a task list item
      const index = src.match(/^\s*[-+*]\s+\[([ xX])\]\s+/)?.index
      return index !== undefined ? index : -1
    },
    tokenize(src, tokens, lexer) {
      // Helper function to recursively parse task lists
      const parseTaskListContent = (content: string): any[] | undefined => {
        const nestedResult = parseIndentedBlocks(
          content,
          {
            itemPattern: /^(\s*)([-+*])\s+\[([ xX])\]\s+(.*)$/,
            extractItemData: match => ({
              indentLevel: match[1].length,
              mainContent: match[4],
              checked: match[3].toLowerCase() === 'x',
            }),
            createToken: (data, nestedTokens) => ({
              type: 'taskItem',
              raw: '',
              mainContent: data.mainContent,
              indentLevel: data.indentLevel,
              checked: data.checked,
              text: data.mainContent,
              tokens: lexer.inlineTokens(data.mainContent),
              nestedTokens,
            }),
            // Allow recursive nesting
            customNestedParser: parseTaskListContent,
          },
          lexer,
        )

        if (nestedResult) {
          // Return as task list token
          return [
            {
              type: 'taskList',
              raw: nestedResult.raw,
              items: nestedResult.items,
            },
          ]
        }

        // Fall back to regular markdown parsing if not a task list
        return lexer.blockTokens(content)
      }

      const result = parseIndentedBlocks(
        src,
        {
          itemPattern: /^(\s*)([-+*])\s+\[([ xX])\]\s+(.*)$/,
          extractItemData: match => ({
            indentLevel: match[1].length,
            mainContent: match[4],
            checked: match[3].toLowerCase() === 'x',
          }),
          createToken: (data, nestedTokens) => ({
            type: 'taskItem',
            raw: '',
            mainContent: data.mainContent,
            indentLevel: data.indentLevel,
            checked: data.checked,
            text: data.mainContent,
            tokens: lexer.inlineTokens(data.mainContent),
            nestedTokens,
          }),
          // Use the recursive parser for nested content
          customNestedParser: parseTaskListContent,
        },
        lexer,
      )

      if (!result) {
        return undefined
      }

      return {
        type: 'taskList',
        raw: result.raw,
        items: result.items,
      }
    },
  },

  markdownOptions: {
    indentsContent: true,
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
