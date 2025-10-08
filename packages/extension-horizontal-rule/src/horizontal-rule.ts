import { canInsertNode, isNodeSelection, mergeAttributes, Node, nodeInputRule } from '@tiptap/core'
import { NodeSelection, TextSelection } from '@tiptap/pm/state'

export interface HorizontalRuleOptions {
  /**
   * The HTML attributes for a horizontal rule node.
   * @default {}
   * @example { class: 'foo' }
   */
  HTMLAttributes: Record<string, any>
  /**
   * The default type to insert after the horizontal rule.
   * @default "paragraph"
   * @example "heading"
   */
  nextNodeType: string
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    horizontalRule: {
      /**
       * Add a horizontal rule
       * @example editor.commands.setHorizontalRule()
       */
      setHorizontalRule: () => ReturnType
    }
  }
}

/**
 * This extension allows you to insert horizontal rules.
 * @see https://www.tiptap.dev/api/nodes/horizontal-rule
 */
export const HorizontalRule = Node.create<HorizontalRuleOptions>({
  name: 'horizontalRule',

  addOptions() {
    return {
      HTMLAttributes: {},
      nextNodeType: 'paragraph',
    }
  },

  group: 'block',

  parseHTML() {
    return [{ tag: 'hr' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['hr', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)]
  },

  markdownTokenName: 'hr',

  parseMarkdown: (token, helpers) => {
    return helpers.createNode('horizontalRule')
  },

  renderMarkdown: () => {
    return '---'
  },

  addCommands() {
    return {
      setHorizontalRule:
        () =>
        ({ chain, state }) => {
          // Check if we can insert the node at the current selection
          if (!canInsertNode(state, state.schema.nodes[this.name])) {
            return false
          }

          const { selection } = state
          const { $to: $originTo } = selection

          const currentChain = chain()

          if (isNodeSelection(selection)) {
            currentChain.insertContentAt($originTo.pos, {
              type: this.name,
            })
          } else {
            currentChain.insertContent({ type: this.name })
          }

          return (
            currentChain
              // set cursor after horizontal rule
              .command(({ state: chainState, tr, dispatch }) => {
                if (dispatch) {
                  const { $to } = tr.selection
                  const posAfter = $to.end()

                  if ($to.nodeAfter) {
                    if ($to.nodeAfter.isTextblock) {
                      tr.setSelection(TextSelection.create(tr.doc, $to.pos + 1))
                    } else if ($to.nodeAfter.isBlock) {
                      tr.setSelection(NodeSelection.create(tr.doc, $to.pos))
                    } else {
                      tr.setSelection(TextSelection.create(tr.doc, $to.pos))
                    }
                  } else {
                    // add node after horizontal rule if it’s the end of the document
                    const nodeType =
                      chainState.schema.nodes[this.options.nextNodeType] || $to.parent.type.contentMatch.defaultType
                    const node = nodeType?.create()

                    if (node) {
                      tr.insert(posAfter, node)
                      tr.setSelection(TextSelection.create(tr.doc, posAfter + 1))
                    }
                  }

                  tr.scrollIntoView()
                }

                return true
              })
              .run()
          )
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
