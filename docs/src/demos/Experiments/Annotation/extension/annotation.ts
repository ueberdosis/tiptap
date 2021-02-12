import * as Y from 'yjs'
import { Extension, Command } from '@tiptap/core'
import { AnnotationPlugin, AnnotationPluginKey } from './AnnotationPlugin'

export interface AddAnnotationAction {
  type: 'addAnnotation',
  data: any,
  from: number,
  to: number,
}

export interface UpdateAnnotationAction {
  type: 'updateAnnotation',
  id: string,
  data: any,
}

export interface DeleteAnnotationAction {
  type: 'deleteAnnotation',
  id: string,
}

export interface AnnotationOptions {
  HTMLAttributes: {
    [key: string]: any
  },
  /**
   * An event listener which receives annotations for the current selection.
   */
  onUpdate: (items: [any?]) => {},
  /**
   * An initialized Y.js document.
   */
  document: Y.Doc | null,
  /**
   * Name of a Y.js map, can be changed to sync multiple fields with one Y.js document.
   */
  field: string,
  /**
   * A raw Y.js map, can be used instead of `document` and `field`.
   */
  map: Y.Map<any> | null,
}

function getMapFromOptions(options: AnnotationOptions): Y.Map<any> {
  return options.map
    ? options.map
    : options.document?.getMap(options.field) as Y.Map<any>
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

  onCreate() {
    const map = getMapFromOptions(this.options)

    map.observe(e => {
      console.log('should update annotations', e)

      const transaction = this.editor.state.tr.setMeta(AnnotationPluginKey, {
        type: 'updateAnnotations',
      })

      this.editor.view.dispatch(transaction)
    })
  },

  addCommands() {
    return {
      addAnnotation: (data: any): Command => ({ dispatch, state }) => {
        const { selection } = state

        if (selection.empty) {
          return false
        }

        if (dispatch && data) {
          state.tr.setMeta(AnnotationPluginKey, <AddAnnotationAction>{
            type: 'addAnnotation',
            from: selection.from,
            to: selection.to,
            data,
          })
        }

        return true
      },
      updateAnnotation: (id: string, data: any): Command => ({ dispatch, state }) => {
        if (dispatch) {
          state.tr.setMeta(AnnotationPluginKey, <UpdateAnnotationAction>{
            type: 'updateAnnotation',
            data,
          })
        }

        return true
      },
      deleteAnnotation: (id: string): Command => ({ dispatch, state }) => {
        if (dispatch) {
          state.tr.setMeta(AnnotationPluginKey, <DeleteAnnotationAction>{
            type: 'deleteAnnotation',
            id,
          })
        }

        return true
      },
    }
  },

  addProseMirrorPlugins() {
    return [
      AnnotationPlugin({
        HTMLAttributes: this.options.HTMLAttributes,
        onUpdate: this.options.onUpdate,
        map: getMapFromOptions(this.options),
      }),
    ]
  },
})

declare module '@tiptap/core' {
  interface AllExtensions {
    Annotation: typeof Annotation,
  }
}
