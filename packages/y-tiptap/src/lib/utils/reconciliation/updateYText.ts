import type { BindingMetadata } from '../../../types/BindingMetadata.js'
import * as PModel from 'prosemirror-model'
import { simpleDiff } from 'lib0/diff'
import * as Y from 'yjs'
import { ytextTrans } from './ytextTrans.js'
import { marksToAttributes } from '../conversion/marksToAttributes.js'

export const updateYText = (ytext: Y.Text, ptexts: PModel.Node[], meta: BindingMetadata) => {
  meta.mapping.set(ytext, ptexts)
  const { nAttrs, str } = ytextTrans(ytext)
  const content = ptexts.map(p => ({
    insert: p.text ?? '',
    attributes: Object.assign({}, nAttrs, marksToAttributes(p.marks, meta)),
  }))
  const { insert, remove, index } = simpleDiff(str, content.map(c => c.insert).join(''))
  ytext.delete(index, remove)
  ytext.insert(index, insert)
  ytext.applyDelta(content.map(c => ({ retain: c.insert.length, attributes: c.attributes })))
}
