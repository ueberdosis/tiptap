import { Extension, Plugin } from 'tiptap'
import { DecorationSet, Decoration } from 'prosemirror-view'

export default class Focus extends Extension {

  get name() {
    return 'focus'
  }

  get defaultOptions() {
    return {
      className: 'has-focus',
      nested: false,
    }
  }

  get plugins() {
    return [
      new Plugin({
        props: {
          decorations: ({ doc, plugins, selection }) => {
            const editablePlugin = plugins.find(plugin => plugin.key.startsWith('editable$'))
            const editable = editablePlugin.props.editable()
            const active = editable && this.options.className
            const { focused } = this.editor
            const { anchor } = selection
            const decorations = []

            if (!active || !focused) {
              return false
            }

            doc.descendants((node, pos) => {
              const hasAnchor = anchor >= pos && anchor <= (pos + node.nodeSize)

              if (hasAnchor && !node.isText) {
                const decoration = Decoration.node(pos, pos + node.nodeSize, {
                  class: this.options.className,
                })
                decorations.push(decoration)
              }

              return this.options.nested
            })

            return DecorationSet.create(doc, decorations)
          },
        },
      }),
    ]
  }

}
