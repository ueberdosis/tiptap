// @ts-nocheck
import { Decoration, DecorationSet } from 'prosemirror-view'
import { ySyncPluginKey } from 'y-prosemirror'
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

  apply(transaction: any, editor: any) {
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

    const ystate = ySyncPluginKey.getState(editor.state)

    if (ystate && ystate.isChangeOrigin) {
      // TODO: Create new decorations
      // console.log(ystate.doc, ystate.type, ystate.binding)

      return this
    }

    // Apply ProseMirror mapping
    const decorations = this.decorations.map(transaction.mapping, transaction.doc)
    return new AnnotationState(decorations)

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

  static init(config: any, state: any) {
    // TODO: Load initial decorations from Y.js?
    const decorations = DecorationSet.create(state.doc, [
      Decoration.inline(105, 190, { class: 'annotation' }, { data: { id: 123, content: 'foobar' } }),
    ])

    return new AnnotationState(decorations)
  }
}
