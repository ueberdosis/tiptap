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

    // TODO: Observe Y.js changes and re-render decorations
    // this.options.map.observe(e => {
    //   console.log('e', e)
    // })
  }

  findAnnotation(id: number) {
    // TODO: Get from Y.js?
    // this.decorations.get(id)

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
    const { map, HTMLAttributes } = this.options
    const ystate = ySyncPluginKey.getState(state)
    const { doc, type, binding } = ystate
    const action = transaction.getMeta(AnnotationPluginKey)

    if (action && action.type) {
      const { from, to, data } = action

      if (action.type === 'addAnnotation') {
        const absoluteFrom = absolutePositionToRelativePosition(from, type, binding.mapping)
        const absoluteTo = absolutePositionToRelativePosition(to, type, binding.mapping)

        map.set(data.id, {
          from: absoluteFrom,
          to: absoluteTo,
          data,
        })

        const decoration = Decoration.inline(from, to, HTMLAttributes, { data })

        this.decorations = this.decorations.add(transaction.doc, [decoration])
      }

      if (action.type === 'deleteAnnotation') {
        map.delete(action.id)

        const decoration = this.findAnnotation(action.id)

        this.decorations = this.decorations.remove([decoration])
      }

      return this
    }

    if (ystate.isChangeOrigin) {

      const decorations = Array.from(map.keys()).map(id => {
        const dec = map.get(id)
        const from = relativePositionToAbsolutePosition(doc, type, dec.from, binding.mapping)
        const to = relativePositionToAbsolutePosition(doc, type, dec.to, binding.mapping)
        const decoration = Decoration.inline(from, to, HTMLAttributes, { data: dec.data })

        return decoration
      })

      this.decorations = DecorationSet.create(state.doc, decorations)

      return this
    }

    // Apply ProseMirror mapping
    this.decorations = this.decorations.map(transaction.mapping, transaction.doc)

    return this
  }
}
