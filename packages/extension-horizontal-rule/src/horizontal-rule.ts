import {
  Command,
  Node,
  nodeInputRule,
  mergeAttributes,
} from '@tiptap/core'

export interface HorizontalRuleOptions {
  HTMLAttributes: {
    [key: string]: any
  },
}

declare module '@tiptap/core' {
  interface Commands {
    /**
     * Add a horizontal rule
     */
    setHorizontalRule: () => Command,
  }
}

export const HorizontalRule = Node.create({
  name: 'horizontalRule',

  defaultOptions: <HorizontalRuleOptions>{
    HTMLAttributes: {},
  },

  group: 'block',

  parseHTML() {
    return [
      { tag: 'hr' },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['hr', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)]
  },

  addCommands() {
    return {
      setHorizontalRule: () => ({ tr, dispatch }) => {
        if (dispatch) {
          tr.replaceSelectionWith(this.type.create())
        }

        return true
      },
    }
  },

  addInputRules() {
    return [
      nodeInputRule(/^(?:---|___\s|\*\*\*\s)$/, this.type),
    ]
  },
})
