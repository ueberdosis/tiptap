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
      /**
       * Add a horizontal rule
       */
      setHorizontalRule: (): Command => ({ tr, dispatch }) => {
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

declare module '@tiptap/core' {
  interface AllExtensions {
    HorizontalRule: typeof HorizontalRule,
  }
}
