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
}

declare module '@tiptap/core' {
  interface Commands {
    addAnnotation: (content: any) => Command,
    deleteAnnotation: (id: number) => Command,
  }
}

export const Annotation = Extension.create({
  name: 'annotation',

  defaultOptions: <AnnotationOptions>{
    HTMLAttributes: {
      class: 'annotation',
    },
    onUpdate: decorations => decorations,
  },

  addCommands() {
    return {
      addAnnotation: (content: any) => ({ dispatch, state }) => {
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
      deleteAnnotation: (id: number) => ({ dispatch, state }) => {
        if (dispatch) {
          dispatch(state.tr.setMeta(AnnotationPluginKey, { type: 'deleteAnnotation', id }))
        }

        return true
      },
    }
  },

  addProseMirrorPlugins() {
    return [
      AnnotationPlugin(this.options),
    ]
  },
})
