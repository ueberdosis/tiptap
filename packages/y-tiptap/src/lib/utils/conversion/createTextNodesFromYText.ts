import type { TextDelta } from '../../../types/TextDelta.js'
import type { BindingMetadata } from '../../../types/BindingMetadata.js'
import type { ComputeYChange } from '../../../types/YChange.js'
import * as PModel from 'prosemirror-model'
import * as Y from 'yjs'
import { getContentSnapshot } from './getContentSnapshot.js'
import { getRemovedTextDeltas } from './getRemovedTextDeltas.js'
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
  const deltas: TextDelta[] =
    isRemoved && contentSnapshot !== undefined
      ? getRemovedTextDeltas(text, contentSnapshot, computeYChange)
      : text.toDelta(snapshot, prevSnapshot, computeYChange)
  return deltas.map(delta => schema.text(delta.insert, attributesToMarks(delta.attributes, schema)))
}
