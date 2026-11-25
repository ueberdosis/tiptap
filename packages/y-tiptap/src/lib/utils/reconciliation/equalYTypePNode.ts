import type { BindingMetadata } from '../../../types/BindingMetadata.js'
import * as PModel from 'prosemirror-model'
import * as Y from 'yjs'
import { equalAttrs } from './equalAttrs.js'
import { normalizePNodeContent } from '../conversion/normalizePNodeContent.js'
import { equalYTextPText } from './equalYTextPText.js'
import { mappedIdentity } from './mappedIdentity.js'
import { matchNodeName } from './matchNodeName.js'

export const equalYTypePNode = (
  ytype: Y.XmlElement<{ [key: string]: string }> | Y.XmlHook | Y.XmlText,
  pnode: PModel.Node | PModel.Node[],
  mapping?: BindingMetadata['mapping'],
): boolean => {
  if (ytype instanceof Y.XmlElement && !(pnode instanceof Array) && matchNodeName(ytype, pnode)) {
    const normalizedContent = normalizePNodeContent(pnode)
    return (
      ytype._length === normalizedContent.length &&
      equalAttrs(ytype.getAttributes(), pnode.attrs) &&
      ytype
        .toArray()
        .every(
          (ychild, index) =>
            mappedIdentity(mapping?.get(ychild), normalizedContent[index]) ||
            equalYTypePNode(ychild, normalizedContent[index], mapping),
        )
    )
  }
  return ytype instanceof Y.XmlText && pnode instanceof Array && equalYTextPText(ytype, pnode)
}
