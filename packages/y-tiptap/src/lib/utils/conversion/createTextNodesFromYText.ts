import type { TextDelta } from '../../../types/TextDelta.js'
import type { BindingMetadata } from '../../../types/BindingMetadata.js'
import type { ComputeYChange } from '../../../types/YChange.js'
import * as PModel from 'prosemirror-model'
import * as Y from 'yjs'
import { attributesToMarks } from './attributesToMarks.js'
import { deleteYType } from './deleteYType.js'
import { toError } from './toError.js'

export const createTextNodesFromYText = (
  text: Y.XmlText,
  schema: PModel.Schema,
  meta: BindingMetadata,
  snapshot?: Y.Snapshot,
  prevSnapshot?: Y.Snapshot,
  computeYChange?: ComputeYChange,
) => {
  const deltas: TextDelta[] = text.toDelta(snapshot, prevSnapshot, computeYChange)
  try {
    return deltas.map(delta =>
      schema.text(delta.insert, attributesToMarks(delta.attributes, schema)),
    )
  } catch (error) {
    if (meta.reportInvalidContent) {
      meta.reportInvalidContent(toError(error))
    } else {
      deleteYType(text)
    }
    return null
  }
}
