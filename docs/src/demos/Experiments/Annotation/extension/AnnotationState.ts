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
    const action = transaction.getMeta(AnnotationPluginKey)
    const actionType = action && action.type

    if (action) {
      let { decorations } = this

      if (actionType === 'addAnnotation') {
        decorations = decorations.add(transaction.doc, [
          Decoration.inline(action.from, action.to, { class: 'annotation' }, { data: action.data }),
        ])
      } else if (actionType === 'deleteAnnotation') {
        decorations = decorations.remove([
          this.findAnnotation(action.id),
        ])
      }

      return new AnnotationState(decorations)
    }

    const ystate = ySyncPluginKey.getState(state)

    if (ystate && ystate.isChangeOrigin) {
      // TODO: Create new decorations

      const relative = absolutePositionToRelativePosition(
        105,
        ystate.type,
        ystate.binding.mapping,
      )

      const absolute = relativePositionToAbsolutePosition(
        ystate.doc,
        ystate.type,
        relative,
        ystate.binding.mapping,
      )

      console.log({
        decorations: this.decorations,
        state,
        ystate,
        relative,
        absolute,
      })

      return this
    }

    // // Apply ProseMirror mapping
    // const decorations = this.decorations.map(transaction.mapping, transaction.doc)
    // return new AnnotationState(decorations)

    return this

    // Y.createRelativePositionFromJSON(aw.cursor.anchor), // {any} relPos Encoded Yjs based relative position
    // ystate.binding.mapping, // ProsemirrorMapping} mapping

    // relativePositionToAbsolutePosition
    // console.log({foo})

    // TODO:
    // if (?) {
    //   // map positions of decorations with Y.js
    // const { mapping } = transaction
    // const decorations = this.decorations.map(mapping, transaction.doc)
    // return new AnnotationState(decorations)
    // }
    // Resources to check: y-prosemirror createDecorations
  }

  static init(config: any, state: EditorState) {
    // TODO: Load initial decorations from Y.js?
    const decorations = DecorationSet.create(state.doc, [
      Decoration.inline(105, 190, { class: 'annotation' }, { data: { id: 123, content: 'foobar' } }),
    ])

    return new AnnotationState(decorations)
  }
}
