import { mergeAttributes, Node } from '@tiptap/core'

export interface ListItemOptions {
  /**
   * The HTML attributes for a list item node.
   * @default {}
   * @example { class: 'foo' }
   */
  HTMLAttributes: Record<string, any>

  /**
   * The node type for bulletList nodes
   * @default 'bulletList'
   * @example 'myCustomBulletList'
   */
  bulletListTypeName: string

  /**
   * The node type for orderedList nodes
   * @default 'orderedList'
   * @example 'myCustomOrderedList'
   */
  orderedListTypeName: string
}

/**
 * This extension allows you to create list items.
 * @see https://www.tiptap.dev/api/nodes/list-item
 */
export const ListItem = Node.create<ListItemOptions>({
  name: 'listItem',

  addOptions() {
    return {
      HTMLAttributes: {},
      bulletListTypeName: 'bulletList',
      orderedListTypeName: 'orderedList',
    }
  },

  content: 'paragraph block*',

  defining: true,

  parseHTML() {
    return [
      {
        tag: 'li',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['li', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

  markdown: {
    render: (node, h, ctx) => {
      if (!node || !Array.isArray(node.content)) {
        return ''
      }

      const listCharacter = ctx.parentType === 'bulletList' ? '-' : `${ctx.index + 1}.`

      const [content, ...children] = node.content

      const output = [`${listCharacter} ${h.renderChildren(content)}`]
      const childOutput: string[] = []

      children.forEach(child => {
        childOutput.push(`${h.renderChildren(child)}`)
      })

      if (childOutput && childOutput.length > 0) {
        const childContent = childOutput
          .join('')
          .split('\n')
          .map(line => h.indent(line))
          .join('\n')

        output.push(childContent)
      }

      return output.join('\n')
    },
  },

  addKeyboardShortcuts() {
    return {
      Enter: () => this.editor.commands.splitListItem(this.name),
      Tab: () => this.editor.commands.sinkListItem(this.name),
      'Shift-Tab': () => this.editor.commands.liftListItem(this.name),
    }
  },
})
