// @ts-nocheck
import * as Y from 'yjs'
import { EditorState } from 'prosemirror-state'
import { Decoration, DecorationSet } from 'prosemirror-view'
import { ySyncPluginKey, relativePositionToAbsolutePosition, absolutePositionToRelativePosition } from 'y-prosemirror'
import { AnnotationPluginKey } from './AnnotationPlugin'

export class AnnotationState {
  private decorations: any

  constructor(decorations: any) {
    this.decorations = decorations
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
    return this.decorations.find(position, position)
  }

  apply(transaction: any, state: EditorState) {
    const ystate = ySyncPluginKey.getState(state)
    const decs = ystate.doc.getMap('annotations')

    const action = transaction.getMeta(AnnotationPluginKey)
    const actionType = action && action.type

    if (action) {
      let { decorations } = this

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

        decorations = decorations.add(transaction.doc, [
          Decoration.inline(action.from, action.to, { class: 'annotation' }, { data: action.data }),
        ])
      } else if (actionType === 'deleteAnnotation') {
        decs.delete(action.id)

        decorations = decorations.remove([
          this.findAnnotation(action.id),
        ])
      }

      return new AnnotationState(decorations)
    }

    const decorations = [];

    [...decs.keys()].forEach(id => {
      const dec = decs.get(id)

      decorations.push([
        Decoration.inline(
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
          { class: 'annotation' },
          { data: dec.data },
        ),
      ])
    })

    return new AnnotationState(DecorationSet.create(state.doc, decorations))

    // if (ystate && ystate.isChangeOrigin) {
    //
    // }

    // // Apply ProseMirror mapping
    // const decorations = this.decorations.map(transaction.mapping, transaction.doc)
    // return new AnnotationState(decorations)

    // return this
  }

  static init(config: any, state: EditorState) {
    const decorations = DecorationSet.create(state.doc, [])

    return new AnnotationState(decorations)
  }
}
