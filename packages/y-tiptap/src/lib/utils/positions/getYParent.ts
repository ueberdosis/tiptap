import type { YType } from '../../../types/YType.js'
import { AbstractType, XmlFragment, Text, XmlHook } from 'yjs'
import type { Item } from 'yjs'

export function getYParent(item: Item | null): YType | null {
  if (item === null) return null
  if (!(item.parent instanceof AbstractType)) throw new Error('Expected an integrated Yjs parent')
  const type = item.parent
  if (!(type instanceof XmlFragment || type instanceof Text || type instanceof XmlHook))
    throw new Error('Expected a Yjs XML type')
  return type
}
