import type { XmlElement, XmlHook, XmlText } from 'yjs'

export interface MappedChildAnchor {
  yIndex: number
  pIndex: number
  yChild: XmlElement | XmlHook | XmlText
}
