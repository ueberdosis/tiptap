import { mergeAttributes, Node, wrappingInputRule } from '@tiptap/core'

export interface BulletListOptions {
  itemTypeName: string,
  HTMLAttributes: Record<string, any>,
  keepMarks: boolean,
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    bulletList: {
      /**
       * Toggle a bullet list
       */
      toggleBulletList: () => ReturnType,
    }
  }
}

export const inputRegex = /^\s*([-+*])\s$/

export const BulletList = Node.create<BulletListOptions>({
  name: 'bulletList',

  addOptions() {
    return {
      itemTypeName: 'listItem',
      HTMLAttributes: {},
      keepMarks: false,
    }
  },

  group: 'block list',

  content() {
    return `${this.options.itemTypeName}+`
  },

  parseHTML() {
    return [
      { tag: 'ul' },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['ul', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

  addCommands() {
    return {
      toggleBulletList: () => ({ commands }) => {
        return commands.toggleList(this.name, this.options.itemTypeName)
      },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-8': () => this.editor.commands.toggleBulletList(),
    }
  },

  addInputRules() {
    let inputRule = wrappingInputRule({
      find: inputRegex,
      type: this.type,
    })

    if (this.options.keepMarks) {
      inputRule = wrappingInputRule({
        find: inputRegex,
        type: this.type,
        keepMarks: true,
        editor: this.editor,
      })
    }
    return [
      inputRule,
    ]
  },
})
