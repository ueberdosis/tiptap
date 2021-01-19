import { Plugin, PluginKey } from 'prosemirror-state'
import { AnnotationState } from './AnnotationState'

export const AnnotationPluginKey = new PluginKey('annotation')

export const AnnotationPlugin = (options: any) => new Plugin({
  key: AnnotationPluginKey,
  state: {
    init: AnnotationState.init,
    apply(transaction, prevState) {
      return prevState.apply(transaction)
    },
  },
  props: {
    decorations(state) {
      const { decorations } = this.getState(state)
      const { selection } = state

      if (!selection.empty) {
        return decorations
      }

      const annotations = this
        .getState(state)
        .annotationsAt(selection.from)

      options.onUpdate(annotations)

      return decorations
    },

  },
})
