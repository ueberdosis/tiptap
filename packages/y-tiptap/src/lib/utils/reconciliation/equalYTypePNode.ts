import * as PModel from 'prosemirror-model'
import * as Y from 'yjs'
import { equalAttrs } from './equalAttrs.js'
import { normalizePNodeContent } from '../conversion/normalizePNodeContent.js'
import { equalYTextPText } from './equalYTextPText.js'
import { matchNodeName } from './matchNodeName.js'

export const equalYTypePNode = (
  ytype: Y.XmlElement<{ [key: string]: string }> | Y.XmlHook | Y.XmlText,
  pnode: PModel.Node | PModel.Node[],
): boolean => {
  if (ytype instanceof Y.XmlElement && !(pnode instanceof Array) && matchNodeName(ytype, pnode)) {
    const normalizedContent = normalizePNodeContent(pnode)
    return (
      ytype._length === normalizedContent.length &&
      equalAttrs(ytype.getAttributes(), pnode.attrs) &&
      ytype.toArray().every((ychild, i) => equalYTypePNode(ychild, normalizedContent[i]))
    )
  }
  return ytype instanceof Y.XmlText && pnode instanceof Array && equalYTextPText(ytype, pnode)
}
