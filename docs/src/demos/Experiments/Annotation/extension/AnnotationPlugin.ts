// @ts-nocheck
import { Plugin, PluginKey } from 'prosemirror-state'
import { AnnotationState } from './AnnotationState'

export const AnnotationPluginKey = new PluginKey('annotation')

export const AnnotationPlugin = (options: any, editor: any) => new Plugin({
  key: AnnotationPluginKey,
  state: {
    init: AnnotationState.init,
    apply(transaction, oldState) {
      return oldState.apply(transaction, editor)
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
