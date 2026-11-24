import type { YType } from '../../../types/YType.js'
import { ContentType, XmlFragment, Text, XmlHook } from 'yjs'
import type { Item } from 'yjs'

export function getYType(item: Item | null | undefined): YType | null {
  if (!item) return null
  if (!(item.content instanceof ContentType)) return null
  const type = item.content.type
  if (!(type instanceof XmlFragment || type instanceof Text || type instanceof XmlHook))
    throw new Error('Expected a Yjs XML type')
  return type
}
