// @ts-nocheck
import * as Y from 'yjs'
import { EditorState } from 'prosemirror-state'
import { Decoration, DecorationSet } from 'prosemirror-view'
import { ySyncPluginKey, relativePositionToAbsolutePosition, absolutePositionToRelativePosition } from 'y-prosemirror'
import { AnnotationPluginKey } from './AnnotationPlugin'

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

  findAnnotation(id: number) {
    const current = this.decorations.find()

    for (let i = 0; i < current.length; i += 1) {
      if (current[i].spec.data.id === id) {
        return current[i]
      }
    }
  }

  annotationsAt(position: number) {
    return this.decorations?.find(position, position)
  }

  apply(transaction: any, state: EditorState) {
    const ystate = ySyncPluginKey.getState(state)
    const decs = this.options.map

    const action = transaction.getMeta(AnnotationPluginKey)
    const actionType = action && action.type

    if (action) {
      const { decorations } = this

      if (actionType === 'addAnnotation') {
        decs.set(action.data.id, {
          from: absolutePositionToRelativePosition(
            action.from,
            ystate.type,
            ystate.binding.mapping,
          ),
          to: absolutePositionToRelativePosition(
            action.to,
            ystate.type,
            ystate.binding.mapping,
          ),
          data: action.data,
        })

        this.decorations = decorations.add(transaction.doc, [
          Decoration.inline(action.from, action.to, this.options.HTMLAttributes, { data: action.data }),
        ])
      } else if (actionType === 'deleteAnnotation') {
        decs.delete(action.id)

        this.decorations = decorations.remove([
          this.findAnnotation(action.id),
        ])
      }

      return this
    }

    if (ystate && ystate.isChangeOrigin) {
      const decorations = [];

      [...decs.keys()].forEach(id => {
        const dec = decs.get(id)

        decorations.push(Decoration.inline(
          relativePositionToAbsolutePosition(
            ystate.doc,
            ystate.type,
            dec.from,
            ystate.binding.mapping,
          ),
          relativePositionToAbsolutePosition(
            ystate.doc,
            ystate.type,
            dec.to,
            ystate.binding.mapping,
          ),
          this.options.HTMLAttributes,
          { data: dec.data },
        ))
      })

      this.decorations = DecorationSet.create(state.doc, decorations)

      return this
    }

    // Apply ProseMirror mapping
    this.decorations = this.decorations.map(transaction.mapping, transaction.doc)

    return this
  }
}
