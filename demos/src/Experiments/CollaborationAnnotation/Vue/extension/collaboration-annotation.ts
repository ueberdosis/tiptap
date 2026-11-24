import { Extension } from '@tiptap/core'
import { AnnotationPlugin } from './AnnotationPlugin.js'
import { createAnnotation } from './createAnnotation.js'
import type { AnnotationOptions } from './types/Annotation.js'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    annotation: {
      /** Stores an annotation for the selected text or node outside the editor document. */
      addAnnotation: (text: string) => ReturnType
      /** Removes an annotation from the shared map. */
      deleteAnnotation: (id: string) => ReturnType
    }
  }
}

export const CollaborationAnnotation = Extension.create<AnnotationOptions>({
  name: 'annotation',

  addOptions() {
    return { map: null, onUpdate: () => {} }
  },

  addCommands() {
    return {
      addAnnotation:
        text =>
        ({ dispatch, state }) => {
          const annotation = createAnnotation(state, text)
          const { map } = this.options

          if (!annotation || !map) {
            return false
          }

          if (dispatch) {
            map.set(crypto.randomUUID(), annotation)
          }

          return true
        },
      deleteAnnotation:
        id =>
        ({ dispatch }) => {
          const { map } = this.options

          if (!map?.has(id)) {
            return false
          }

          if (dispatch) {
            map.delete(id)
          }

          return true
        },
    }
  },

  addProseMirrorPlugins() {
    const { map, onUpdate } = this.options

    if (!map?.doc) {
      throw new Error('Annotations require an integrated Y.Map')
    }

    return [AnnotationPlugin({ document: map.doc, map, onUpdate })]
  },
})
