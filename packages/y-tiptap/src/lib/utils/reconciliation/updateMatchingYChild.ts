import type { FragmentUpdater } from '../../../types/FragmentUpdater.js'
import type { BindingMetadata } from '../../../types/BindingMetadata.js'
import type { TransactionSource } from '../../../types/TransactionSource.js'
import * as PModel from 'prosemirror-model'
import * as Y from 'yjs'
import { equalYTextPText } from './equalYTextPText.js'
import { equalYTypePNode } from './equalYTypePNode.js'
import { updateYText } from './updateYText.js'

import { matchNodeName } from './matchNodeName.js'

export const updateMatchingYChild = (
  y: TransactionSource,
  yChild: Y.XmlElement<{ [key: string]: string }> | Y.XmlHook | Y.XmlText,
  pChild: PModel.Node | PModel.Node[],
  meta: BindingMetadata,
  updateFragment: FragmentUpdater,
) => {
  if (yChild instanceof Y.XmlText && pChild instanceof Array) {
    if (equalYTextPText(yChild, pChild)) {
      meta.mapping.set(yChild, pChild)
    } else {
      updateYText(yChild, pChild, meta)
    }
    return true
  }
  if (
    yChild instanceof Y.XmlElement &&
    !(pChild instanceof Array) &&
    matchNodeName(yChild, pChild)
  ) {
    if (equalYTypePNode(yChild, pChild)) {
      meta.mapping.set(yChild, pChild)
    } else {
      updateFragment(y, yChild, pChild, meta)
    }
    return true
  }
  return false
}
