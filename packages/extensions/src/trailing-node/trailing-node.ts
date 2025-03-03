import { Extension } from '@tiptap/core'
import type { Node, NodeType } from '@tiptap/pm/model'
import { Plugin, PluginKey } from '@tiptap/pm/state'

function nodeEqualsType({ types, node }: { types: NodeType | NodeType[]; node: Node | null | undefined }) {
  return (node && Array.isArray(types) && types.includes(node.type)) || node?.type === types
}

/**
 * Extension based on:
 * - https://github.com/ueberdosis/tiptap/blob/v1/packages/tiptap-extensions/src/extensions/TrailingNode.js
 * - https://github.com/remirror/remirror/blob/e0f1bec4a1e8073ce8f5500d62193e52321155b9/packages/prosemirror-trailing-node/src/trailing-node-plugin.ts
 */

export interface TrailingNodeOptions {
  /**
   * The node type that should be inserted at the end of the document.
   * @note the node will always be added to the `notAfter` lists to
   * prevent an infinite loop.
   * @default 'paragraph'
   */
  node: string
  /**
   * The node types after which the trailing node should not be inserted.
   * @default ['paragraph']
   */
  notAfter?: string | string[]
}

/**
 * This extension allows you to add an extra node at the end of the document.
 * @see https://www.tiptap.dev/api/extensions/trailing-node
 */
export const TrailingNode = Extension.create<TrailingNodeOptions>({
  name: 'trailingNode',

  addOptions() {
    return {
      node: 'paragraph',
      notAfter: [],
    }
  },

  addProseMirrorPlugins() {
    const plugin = new PluginKey(this.name)
    const disabledNodes = Object.entries(this.editor.schema.nodes)
      .map(([, value]) => value)
      .filter(node => (this.options.notAfter || []).concat(this.options.node).includes(node.name))

    return [
      new Plugin({
        key: plugin,
        appendTransaction: (_, __, state) => {
          const { doc, tr, schema } = state
          const shouldInsertNodeAtEnd = plugin.getState(state)
          const endPosition = doc.content.size
          const type = schema.nodes[this.options.node]

          if (!shouldInsertNodeAtEnd) {
            return
          }

          return tr.insert(endPosition, type.create())
        },
        state: {
          init: (_, state) => {
            const lastNode = state.tr.doc.lastChild

            return !nodeEqualsType({ node: lastNode, types: disabledNodes })
          },
          apply: (tr, value) => {
            if (!tr.docChanged) {
              return value
            }

            const lastNode = tr.doc.lastChild

            return !nodeEqualsType({ node: lastNode, types: disabledNodes })
          },
        },
      }),
    ]
  },
})
