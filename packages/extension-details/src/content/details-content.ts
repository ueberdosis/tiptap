import { defaultBlockAt, findParentNode, mergeAttributes, Node } from '@tiptap/core'
import { Selection } from '@tiptap/pm/state'
import type { ViewMutationRecord } from '@tiptap/pm/view'

export interface DetailsContentOptions {
  /**
   * Custom HTML attributes that should be added to the rendered HTML tag.
   */
  HTMLAttributes: {
    [key: string]: any
  }
}

export const DetailsContent = Node.create<DetailsContentOptions>({
  name: 'detailsContent',

  content: 'block+',

  defining: true,

  selectable: false,

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  parseHTML() {
    return [
      {
        tag: `div[data-type="${this.name}"]`,
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { 'data-type': this.name }), 0]
  },

  markdown: {
    render: (node, h) => {
      const content = node.content ? h.renderChildren(node.content, '\n\n') : ''

      return `${content}`
    },
  },

  addNodeView() {
    return ({ HTMLAttributes }) => {
      const dom = document.createElement('div')
      const attributes = mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': this.name,
        hidden: 'hidden',
      })

      Object.entries(attributes).forEach(([key, value]) => dom.setAttribute(key, value))

      dom.addEventListener('toggleDetailsContent', () => {
        dom.toggleAttribute('hidden')
      })

      return {
        dom,
        contentDOM: dom,
        ignoreMutation(mutation: ViewMutationRecord) {
          if (mutation.type === 'selection') {
            return false
          }

          return !dom.contains(mutation.target) || dom === mutation.target
        },
        update: updatedNode => {
          if (updatedNode.type !== this.type) {
            return false
          }

          return true
        },
      }
    }
  },

  addKeyboardShortcuts() {
    return {
      // Escape node on double enter
      Enter: ({ editor }) => {
        const { state, view } = editor
        const { selection } = state
        const { $from, empty } = selection
        const detailsContent = findParentNode(node => node.type === this.type)(selection)

        if (!empty || !detailsContent || !detailsContent.node.childCount) {
          return false
        }

        const fromIndex = $from.index(detailsContent.depth)
        const { childCount } = detailsContent.node
        const isAtEnd = childCount === fromIndex + 1

        if (!isAtEnd) {
          return false
        }

        const defaultChildType = detailsContent.node.type.contentMatch.defaultType
        const defaultChildNode = defaultChildType?.createAndFill()

        if (!defaultChildNode) {
          return false
        }

        const $childPos = state.doc.resolve(detailsContent.pos + 1)
        const lastChildIndex = childCount - 1
        const lastChildNode = detailsContent.node.child(lastChildIndex)
        const lastChildPos = $childPos.posAtIndex(lastChildIndex, detailsContent.depth)
        const lastChildNodeIsEmpty = lastChildNode.eq(defaultChildNode)

        if (!lastChildNodeIsEmpty) {
          return false
        }

        // get parent of details node
        const above = $from.node(-3)

        if (!above) {
          return false
        }

        // get default node type after details node
        const after = $from.indexAfter(-3)
        const type = defaultBlockAt(above.contentMatchAt(after))

        if (!type || !above.canReplaceWith(after, after, type)) {
          return false
        }

        const node = type.createAndFill()

        if (!node) {
          return false
        }

        const { tr } = state
        const pos = $from.after(-2)

        tr.replaceWith(pos, pos, node)

        const $pos = tr.doc.resolve(pos)
        const newSelection = Selection.near($pos, 1)

        tr.setSelection(newSelection)

        const deleteFrom = lastChildPos
        const deleteTo = lastChildPos + lastChildNode.nodeSize

        tr.delete(deleteFrom, deleteTo)
        tr.scrollIntoView()
        view.dispatch(tr)

        return true
      },
    }
  },
})
