import type { TextDelta } from '../../../types/TextDelta.js'
import * as PModel from 'prosemirror-model'
import * as object from 'lib0/object'
import * as Y from 'yjs'
import { equalAttrs } from './equalAttrs.js'
import { yattr2markname } from '../conversion/yattr2markname.js'

export const equalYTextPText = (ytext: Y.XmlText, ptexts: PModel.Node[]) => {
  const delta: TextDelta[] = ytext.toDelta()
  return (
    delta.length === ptexts.length &&
    delta.every(
      (d, i) =>
        d.insert === ptexts[i].text &&
        object.keys(d.attributes || {}).length === ptexts[i].marks.length &&
        Object.entries(d.attributes ?? {}).every(([yattrname, attr]) => {
          const markname = yattr2markname(yattrname)
          const pmarks = ptexts[i].marks
          const pmark = pmarks.find((mark: PModel.Mark) => mark.type.name === markname)
          if (!pmark) {
            return false
          }
          return equalAttrs(attr, pmark.attrs)
        }),
    )
  )
}
