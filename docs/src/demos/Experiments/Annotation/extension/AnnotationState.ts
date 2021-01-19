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

  apply(transaction: any) {
    console.log('transaction', transaction.meta, transaction.docChanged, transaction)

    const yjsTransaction = transaction.getMeta(ySyncPluginKey)
    if (yjsTransaction) {
      // TODO: Map positions
      // absolutePositionToRelativePosition(state.selection.anchor, pmbinding.type, pmbinding.mapping)
      console.log('map positions', transaction, yjsTransaction)

      return this

      // const { binding } = yjsTransaction
      // console.log({ binding }, { transaction }, transaction.docChanged)
      // console.log('yjsTransaction.isChangeOrigin', yjsTransaction.isChangeOrigin)

      // console.log('yjs mapping', yjsTransaction.binding?.mapping)
      // console.log('all decorations', this.decorations.find())
      // console.log('original prosemirror mapping', this.decorations.map(transaction.mapping, transaction.doc))
      // console.log('difference between ProseMirror & Y.js', transaction.mapping, yjsTransaction.binding?.mapping)

      // Code to sync the selection:
      // export const getRelativeSelection = (pmbinding, state) => ({
      //   anchor: absolutePositionToRelativePosition(state.selection.anchor, pmbinding.type, pmbinding.mapping),
      //   head: absolutePositionToRelativePosition(state.selection.head, pmbinding.type, pmbinding.mapping)
      // })

      // console.log(yjsTransaction.binding.mapping, transaction.curSelection.anchor)
    }

    if (transaction.docChanged) {
      // TODO: Fixes the initial load (complete replace of the document)
      // return this

      // TODO: Fixes later changes (typing before the annotation)
      const decorations = this.decorations.map(transaction.mapping, transaction.doc)

      return new AnnotationState(decorations)
    }

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

    return this
  }

  static init(config: any, state: any) {
    // TODO: Load initial decorations from Y.js?
    const decorations = DecorationSet.create(state.doc, [
      Decoration.inline(105, 190, { class: 'annotation' }, { data: { id: 123, content: 'foobar' } }),
    ])

    return new AnnotationState(decorations)
  }
}
