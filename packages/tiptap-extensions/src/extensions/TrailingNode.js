import { Extension, Plugin, PluginKey } from 'tiptap'
import { nodeEqualsType } from 'tiptap-utils'

export default class TrailingNode extends Extension {

  get name() {
    return 'trailing_node'
  }

  get defaultOptions() {
    return {
      node: 'paragraph',
      notAfter: [
        'paragraph',
        'heading',
      ],
    }
  }

  get plugins() {
    const plugin = new PluginKey(this.name)
    const disabledNodes = Object.entries(this.editor.schema.nodes)
      .map(([, value]) => value)
      .filter(node => this.options.notAfter.includes(node.name))

    return [
      new Plugin({
        key: plugin,
        view: () => ({
          update: view => {
            const { state } = view
            const { doc } = state
            const insertNodeAtEnd = plugin.getState(state)

            if (!insertNodeAtEnd) {
              return
            }

            const type = state.schema.nodes[this.options.node]
            view.dispatch(view.state.tr.insert(doc.content.size, type.create()))
          },
        }),
        state: {
          init: (_, state) => {
            const lastNode = state.tr.doc.lastChild
            return !nodeEqualsType({ node: lastNode, types: disabledNodes })
          },
          apply: (tr, oldState) => {
            if (!tr.docChanged) {
              return oldState
            }

            const lastNode = tr.doc.lastChild
            return !nodeEqualsType({ node: lastNode, types: disabledNodes })
          },
        },
      }),
    ]
  }

}
