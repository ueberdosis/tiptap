import {
  Node,
  nodeInputRule,
  mergeAttributes,
} from '@tiptap/core'
import { TextSelection } from 'prosemirror-state'

export interface HorizontalRuleOptions {
  HTMLAttributes: Record<string, any>,
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    horizontalRule: {
      /**
       * Add a horizontal rule
       */
      setHorizontalRule: () => ReturnType,
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
      setHorizontalRule: () => ({ chain }) => {
        return chain()
          // remove node before hr if it’s an empty text block
          .command(({ tr, dispatch }) => {
            const { selection } = tr
            const { empty, $anchor } = selection
            const isEmptyTextBlock = $anchor.parent.isTextblock
              && !$anchor.parent.type.spec.code
              && !$anchor.parent.textContent

            if (!empty || !isEmptyTextBlock || !dispatch) {
              return true
            }

            const from = $anchor.before()
            const to = $anchor.start()

            tr.deleteRange(from, to)
            tr.setSelection(TextSelection.create(tr.doc, from))

            return true
          })
          .insertContent({ type: this.name })
          // add node after hr if it’s the end of the document
          .command(({ tr, dispatch }) => {
            if (dispatch) {
              const { parent, pos } = tr.selection.$from
              const posAfter = pos + 1
              const nodeAfter = tr.doc.nodeAt(posAfter)

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
          })
          .run()
      },
    }
  },

  addInputRules() {
    return [
      nodeInputRule({
        find: /^(?:---|—-|___\s|\*\*\*\s)$/,
        type: this.type,
      }),
    ]
  },
})
