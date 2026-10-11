import type { TextDelta } from '../../../types/TextDelta.js'
import type { BindingMetadata } from '../../../types/BindingMetadata.js'
import type { ComputeYChange } from '../../../types/YChange.js'
import * as PModel from 'prosemirror-model'
import * as error from 'lib0/error'
import { ySyncPluginKey } from '../../plugins/keys.js'
import * as Y from 'yjs'
import { attributesToMarks } from './attributesToMarks.js'

export const createTextNodesFromYText = (
  text: Y.XmlText,
  schema: PModel.Schema,
  _meta: BindingMetadata,
  snapshot?: Y.Snapshot,
  prevSnapshot?: Y.Snapshot,
  computeYChange?: ComputeYChange,
) => {
  const nodes: PModel.Node[] = []
  const deltas: TextDelta[] = text.toDelta(snapshot, prevSnapshot, computeYChange)
  try {
    for (let i = 0; i < deltas.length; i++) {
      const delta = deltas[i]
      nodes.push(schema.text(delta.insert, attributesToMarks(delta.attributes, schema)))
    }
  } catch {
    const doc = text.doc
    const item = text._item
    if (!doc || !item) throw error.unexpectedCase()
    doc.transact(transaction => {
      item.delete(transaction)
    }, ySyncPluginKey)
    return null
  }
  return nodes
}
