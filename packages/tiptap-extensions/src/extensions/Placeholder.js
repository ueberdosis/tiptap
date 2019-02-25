import { Extension, Plugin } from 'tiptap'
import { Decoration, DecorationSet } from 'prosemirror-view'

export default class Placeholder extends Extension {

  get name() {
    return 'placeholder'
  }

  get defaultOptions() {
    return {
      emptyNodeClass: 'is-empty',
      emptyNodeText: 'Write something...',
      showOnlyWhenEditable: true,
    }
  }

  get update() {
    return ({ state, view }) => {
      // TODO: fix error when content is not empty
      view.updateState(state)
    }
  }

  get plugins() {
    return [
      new Plugin({
        props: {
          decorations: ({ doc, plugins }) => {
            const editablePlugin = plugins.find(plugin => plugin.key.startsWith('editable$'))
            const editable = editablePlugin.props.editable()
            const active = editable || !this.options.showOnlyWhenEditable

            if (!active) {
              return false
            }

            const decorations = []
            const completelyEmpty = doc.textContent === '' && doc.childCount <= 1 && doc.content.size <= 2

            doc.descendants((node, pos) => {
              if (!completelyEmpty) {
                return
              }

              const decoration = Decoration.node(pos, pos + node.nodeSize, {
                class: this.options.emptyNodeClass,
                'data-empty-text': this.options.emptyNodeText,
              })
              decorations.push(decoration)
            })

            return DecorationSet.create(doc, decorations)
          },
        },
      }),
    ]
  }

}
