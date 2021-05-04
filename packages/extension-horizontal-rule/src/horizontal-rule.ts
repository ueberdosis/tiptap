import {
  Command,
  Node,
  nodeInputRule,
  mergeAttributes,
} from '@tiptap/core'
import { TextSelection } from 'prosemirror-state'

export interface HorizontalRuleOptions {
  HTMLAttributes: Record<string, any>,
}

declare module '@tiptap/core' {
  interface Commands {
    horizontalRule: {
      /**
       * Add a horizontal rule
       */
      setHorizontalRule: () => Command,
    }
  }
}

export const HorizontalRule = Node.create<HorizontalRuleOptions>({
  name: 'horizontalRule',

  defaultOptions: {
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

          const { parent, pos } = tr.selection.$from
          const posAfter = pos + 1
          const nodeAfter = tr.doc.nodeAt(posAfter)

          // end of document
          if (!nodeAfter) {
            const node = parent.type.contentMatch.defaultType?.create()

            if (node) {
              tr.insert(posAfter, node)
              tr.setSelection(TextSelection.create(tr.doc, posAfter))
            }
          }

          tr.scrollIntoView()
        }

        return true
      },
    }
  },

  addInputRules() {
    return [
      nodeInputRule(/^(?:---|\—-|___\s|\*\*\*\s)$/, this.type),
    ]
  },
})
