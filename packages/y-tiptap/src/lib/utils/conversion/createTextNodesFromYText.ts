import type { TextDelta } from '../../../types/TextDelta.js'
import type { BindingMetadata } from '../../../types/BindingMetadata.js'
import type { ComputeYChange } from '../../../types/YChange.js'
import * as PModel from 'prosemirror-model'
import * as Y from 'yjs'
import { getContentSnapshot } from './getContentSnapshot.js'
import { attributesToMarks } from './attributesToMarks.js'

export const createTextNodesFromYText = (
  text: Y.XmlText,
  schema: PModel.Schema,
  _meta: BindingMetadata,
  snapshot?: Y.Snapshot,
  prevSnapshot?: Y.Snapshot,
  computeYChange?: ComputeYChange,
) => {
  const contentSnapshot = getContentSnapshot(text, snapshot, prevSnapshot)
  const isRemoved = contentSnapshot !== snapshot
  const deltas: TextDelta[] = isRemoved
    ? text.toDelta(contentSnapshot, undefined, computeYChange)
    : text.toDelta(snapshot, prevSnapshot, computeYChange)
  return deltas.map(delta => {
    const attrs = { ...delta.attributes }
    if (isRemoved && computeYChange && text._item !== null) {
      attrs.ychange = { ...computeYChange('removed', text._item.id) }
    }
    return schema.text(delta.insert, attributesToMarks(attrs, schema))
  })
}
