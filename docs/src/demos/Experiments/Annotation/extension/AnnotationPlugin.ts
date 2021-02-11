import * as Y from 'yjs'
import { Plugin, PluginKey } from 'prosemirror-state'
import { AnnotationState } from './AnnotationState'

export const AnnotationPluginKey = new PluginKey('annotation')

export interface AnnotationPluginOptions {
  HTMLAttributes: {
    [key: string]: any
  },
  onUpdate: (items: [any?]) => {},
  map: Y.Map<any>,
}

export const AnnotationPlugin = (options: AnnotationPluginOptions) => new Plugin({
  key: AnnotationPluginKey,

  state: {
    init() {
      return new AnnotationState({
        HTMLAttributes: options.HTMLAttributes,
        map: options.map,
      })
    },
    apply(transaction, pluginState, oldState, newState) {
      return pluginState.apply(transaction, newState)
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
