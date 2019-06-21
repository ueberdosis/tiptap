import { Extension, Plugin } from 'tiptap'
import { Decoration, DecorationSet } from 'prosemirror-view'

export default class Placeholder extends Extension {

  get name() {
    return 'placeholder'
  }

  get defaultOptions() {
    return {
      emptyNodeClass: 'is-empty',
      emptyNodeText: 'Write something …',
      showOnlyWhenEditable: true,
      showOnlyCurrent: true,
    }
  }

  get update() {
    return view => {
      view.updateState(view.state)
    }
  }

  get plugins() {
    return [
      new Plugin({
        props: {
          decorations: ({ doc, plugins, selection }) => {
            const editablePlugin = plugins.find(plugin => plugin.key.startsWith('editable$'))
            const editable = editablePlugin.props.editable()
            const active = editable || !this.options.showOnlyWhenEditable
            const { anchor } = selection
            const decorations = []

            if (!active) {
              return false
            }

            doc.descendants((node, pos) => {
              const hasAnchor = anchor >= pos && anchor <= (pos + node.nodeSize)
              const isEmpty = node.content.size === 0

              if ((hasAnchor || !this.options.showOnlyCurrent) && isEmpty) {
                const decoration = Decoration.node(pos, pos + node.nodeSize, {
                  class: this.options.emptyNodeClass,
                  'data-empty-text': typeof this.options.emptyNodeText === 'function'
                    ? this.options.emptyNodeText(node)
                    : this.options.emptyNodeText,
                })
                decorations.push(decoration)
              }

              return false
            })

            return DecorationSet.create(doc, decorations)
          },
        },
      }),
    ]
  }

}
