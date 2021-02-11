import { Extension, Command } from '@tiptap/core'
import { AnnotationItem } from './AnnotationItem'
import { AnnotationPlugin, AnnotationPluginKey } from './AnnotationPlugin'

function randomId() {
  return Math.floor(Math.random() * 0xffffffff)
}

export interface AnnotationOptions {
  HTMLAttributes: {
    [key: string]: any
  },
  onUpdate: (items: [any?]) => {},
  /**
   * An initialized Y.js document.
   */
  document: any,
  /**
   * Name of a Y.js fragment, can be changed to sync multiple fields with one Y.js document.
   */
  field: string,
  /**
   * A raw Y.js map, can be used instead of `document` and `field`.
   */
  map: any,
}

export const Annotation = Extension.create({
  name: 'annotation',

  defaultOptions: <AnnotationOptions>{
    HTMLAttributes: {
      class: 'annotation',
    },
    onUpdate: decorations => decorations,
    document: null,
    field: 'annotations',
    map: null,
  },

  addCommands() {
    return {
      addAnnotation: (content: any): Command => ({ dispatch, state }) => {
        const { selection } = state

        if (selection.empty) {
          return false
        }

        if (dispatch && content) {
          dispatch(state.tr.setMeta(AnnotationPluginKey, {
            type: 'addAnnotation',
            from: selection.from,
            to: selection.to,
            data: new AnnotationItem(
              randomId(),
              content,
            ),
          }))
        }

        return true
      },
      deleteAnnotation: (id: number): Command => ({ dispatch, state }) => {
        if (dispatch) {
          dispatch(state.tr.setMeta(AnnotationPluginKey, { type: 'deleteAnnotation', id }))
        }

        return true
      },
    }
  },

  addProseMirrorPlugins() {
    const map = this.options.map
      ? this.options.map
      : this.options.document.getMap(this.options.field)

    return [
      AnnotationPlugin({
        HTMLAttributes: this.options.HTMLAttributes,
        onUpdate: this.options.onUpdate,
        map,
      }),
    ]
  },
})

declare module '@tiptap/core' {
  interface AllExtensions {
    Annotation: typeof Annotation,
  }
}
