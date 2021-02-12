import * as Y from 'yjs'
import { Extension, Command } from '@tiptap/core'
import { AnnotationItem } from './AnnotationItem'
import { AnnotationPlugin, AnnotationPluginKey } from './AnnotationPlugin'

function randomId() {
  // TODO: That seems … to simple.
  return Math.floor(Math.random() * 0xffffffff)
}

export interface AddAnnotationAction {
  type: 'addAnnotation',
  from: number,
  to: number,
  data: AnnotationItem,
}

export interface DeleteAnnotationAction {
  id: number,
  type: 'deleteAnnotation',
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
          state.tr.setMeta(AnnotationPluginKey, <AddAnnotationAction>{
            type: 'addAnnotation',
            from: selection.from,
            to: selection.to,
            data: new AnnotationItem(
              randomId(),
              content,
            ),
          })
        }

        return true
      },
      deleteAnnotation: (id: number): Command => ({ dispatch, state }) => {
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
    const map = this.options.map
      ? this.options.map
      : this.options.document?.getMap(this.options.field) as Y.Map<any>

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
