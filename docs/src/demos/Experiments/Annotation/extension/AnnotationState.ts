import * as Y from 'yjs'
import { EditorState, Transaction } from 'prosemirror-state'
import { Decoration, DecorationSet } from 'prosemirror-view'
import { ySyncPluginKey, relativePositionToAbsolutePosition, absolutePositionToRelativePosition } from 'y-prosemirror'
import { AddAnnotationAction, DeleteAnnotationAction } from './annotation'
import { AnnotationPluginKey } from './AnnotationPlugin'
import { AnnotationItem } from './AnnotationItem'

export interface AnnotationStateOptions {
  HTMLAttributes: {
    [key: string]: any
  },
  map: Y.Map<any>,
}

export class AnnotationState {
  options: AnnotationStateOptions

  decorations = DecorationSet.empty

  constructor(options: AnnotationStateOptions) {
    this.options = options
  }

  randomId() {
    // TODO: That seems … to simple.
    return Math.floor(Math.random() * 0xffffffff).toString()
  }

  findAnnotation(id: string) {
    const current = this.decorations.find()

    for (let i = 0; i < current.length; i += 1) {
      if (current[i].spec.id === id) {
        return current[i]
      }
    }
  }

  addAnnotation(action: AddAnnotationAction, state: EditorState) {
    const ystate = ySyncPluginKey.getState(state)
    const { type, binding } = ystate
    const { map } = this.options
    const { from, to, content } = action
    const absoluteFrom = absolutePositionToRelativePosition(from, type, binding.mapping)
    const absoluteTo = absolutePositionToRelativePosition(to, type, binding.mapping)

    map.set(this.randomId(), {
      from: absoluteFrom,
      to: absoluteTo,
      content,
    })
  }

  deleteAnnotation(id: string) {
    const { map } = this.options

    map.delete(id)
  }

  annotationsAt(position: number) {
    return this.decorations.find(position, position).map(decoration => {
      return new AnnotationItem(decoration)
    })
  }

  updateDecorations(state: EditorState) {
    const { map, HTMLAttributes } = this.options
    const ystate = ySyncPluginKey.getState(state)
    const { doc, type, binding } = ystate
    const decorations: Decoration[] = []

    Array
      .from(map.keys())
      .forEach(id => {
        const decoration = map.get(id)
        const from = relativePositionToAbsolutePosition(doc, type, decoration.from, binding.mapping)
        const to = relativePositionToAbsolutePosition(doc, type, decoration.to, binding.mapping)

        if (!from || !to) {
          return
        }

        return decorations.push(
          Decoration.inline(from, to, HTMLAttributes, { id, content: decoration.content }),
        )
      })

    this.decorations = DecorationSet.create(state.doc, decorations)
  }

  apply(transaction: Transaction, state: EditorState) {
    // Add/Remove annotations
    const action = transaction.getMeta(AnnotationPluginKey) as AddAnnotationAction | DeleteAnnotationAction

    if (action && action.type) {
      if (action.type === 'addAnnotation') {
        this.addAnnotation(action, state)
      }

      if (action.type === 'deleteAnnotation') {
        this.deleteAnnotation(action.id)
      }

      // @ts-ignore
      if (action.type === 'updateAnnotations') {
        console.log('updateAnnotations!')
        this.updateDecorations(state)
      }

      return this
    }

    // Use Y.js to update positions
    const ystate = ySyncPluginKey.getState(state)

    if (ystate.isChangeOrigin) {
      this.updateDecorations(state)

      return this
    }

    // Use ProseMirror to update positions
    this.decorations = this.decorations.map(transaction.mapping, transaction.doc)

    return this
  }
}
